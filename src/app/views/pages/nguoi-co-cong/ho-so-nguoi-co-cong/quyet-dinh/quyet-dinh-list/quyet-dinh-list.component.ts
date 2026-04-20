import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCModule } from '../../ho-so-ncc/ho-so-ncc.module';
import { QuyetDinhService } from '../Services/quyet-dinh.service';
import { QuyetDinhDataSource } from '../Model/data-sources/quyet-dinh.datasource';
import { QuyetDinhEditDialogComponent } from './../quyet-dinh-edit/quyet-dinh-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-quyet-dinh-list',
	templateUrl: './quyet-dinh-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuyetDinhListComponent implements OnInit {
	// Table fields
	dataSource: QuyetDinhDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';
	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];

	_name = '';
	objectId = '';
	selected: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;

	constructor(public objectService: QuyetDinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private commonService: CommonService,
		private translate: TranslateService) {
			this._name = this.translate.instant('QUYETDINH.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.SoQuyetDinh = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 1,
				name: 'SoQuyetDinh',
				displayName: 'Số quyết định',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'QuyetDinh',
				displayName: 'Quyết định',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'SoHoSo',
				displayName: 'Số hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'NgayRaQuyetDinh',
				displayName: 'Ngày ra quyết định',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'NgayHieuLuc',
				displayName: 'Ngày hiệu lực',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(
			true,
			this.gridModel.availableColumns
		);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_qd'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_qd'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new QuyetDinhDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) { 
				queryParams = this.objectService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult && this.paginator) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		queryParams.filter.Id_NCC = this.objectId;
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = { ObjectType: this.selected };
		if (this.gridService && this.gridService.model.filterText) {
			filter.SoQuyetDinh = this.gridService.model.filterText.SoQuyetDinh;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.HoTen = this.gridService.model.filterText.HoTen;
		}
		return filter;
	}

	changetab($event: any) {
		this.selected = $event;
		this.loadDataList();
	}

	/** Delete */
	Delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.Delete(item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	Add() {
		const objectModel: any = {}
		this.Edit(objectModel);
	}

	Edit(_item: any, allowEdit: boolean = true) {
		let id_ncc = this.objectId;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(QuyetDinhEditDialogComponent, { data: { _item, allowEdit, id_ncc } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	exportList() {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols
			},
			true
		);
		this.objectService.exportDSQuyetDinh(queryParams).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất danh sách thất bại")
		});
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}

	in(item: any) {
		//this.objectService.previewQD(item.ObjectType, item.Id_NCC, item.Id).subscribe(res => {
		//	if (res && res.status == 1) {
		//		const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		//		dialogRef.afterClosed().subscribe(res => {
		//			if (!res) {
		//			} else {
		//				this.objectService.exportQD(item.ObjectType, item.Id_NCC, item.Id, res.loai).subscribe(response => {
		//					const headers = response.headers;
		//					const filename = headers.get('x-filename');
		//					const type = headers.get('content-type');
		//					const blob = new Blob([response.body], { type });
		//					const fileURL = URL.createObjectURL(blob);
		//					const link = document.createElement('a');
		//					link.href = fileURL;
		//					link.download = filename;
		//					link.click();
		//				});
		//			}
		//		});
		//	} else
		//		this.layoutUtilsService.showError(res.error.message);
		//})
		this.objectService.downloadQD(item.ObjectType, item.Id_NCC, item.Id).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();

			//tắt xem trước
			// let ApiRoot = environment.ApiRoot.slice(0, environment.ApiRoot.length - 3);
			// let path = "viewer/file-dinh-kem/0?path=" + ApiRoot + "dulieu/quyet-dinh/" + filename;
			// window.open(path, "_blank");
		}, err => {
			this.layoutUtilsService.showError("Tải xuống biểu mẫu thất bại");
		});
	}
}
