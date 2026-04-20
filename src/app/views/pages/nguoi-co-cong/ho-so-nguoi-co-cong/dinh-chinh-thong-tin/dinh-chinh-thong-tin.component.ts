
import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { QueryParamsModel } from './../../../../../core/_base/crud/models/query-models/query-params.model';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TableService } from './../../../../partials/table/table.service';
import { TableModel } from './../../../../partials/table/table.model';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { LayoutUtilsService } from './../../../../../core/_base/crud/utils/layout-utils.service';
import { ReviewExportComponent } from './../../components/review-export/review-export.component';
import { HoSoNCCModule } from './../ho-so-ncc/ho-so-ncc.module';
import { DinhChinhThongTinService } from './Services/dinh-chinh-thong-tin.service';
import { DinhChinhModel } from './Model/dinh-chinh.model';
import { DinhChinhDataSource } from './Model/data-sources/dinh-chinh.datasource';
import { DinhchinhthongtinDialogComponent } from './dinhchinhthongtin-dialog/dinhchinhthongtin-dialog.component';
import { QuyetDinhEditDialogComponent } from './../quyet-dinh/quyet-dinh-edit/quyet-dinh-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { HoSoNCCService } from '../ho-so-ncc/Services/ho-so-ncc.service';

@Component({
	selector: 'kt-dinh-chinh-thong-tin',
	templateUrl: './dinh-chinh-thong-tin.component.html'
})
export class DinhChinhThongTinComponent implements OnInit {
	// Table fields
	dataSource: DinhChinhDataSource | undefined;
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
	_user: any = {};
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	ncc: any;
	list_button: boolean = false;

	constructor(
		private router: Router,
		public dinhchinhService: DinhChinhThongTinService,
		private hosoService: HoSoNCCService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private detechChange: ChangeDetectorRef,
		private translate: TranslateService) {
			this._name = this.translate.instant('DINHCHINH.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		var arr = this.router.url.split("/");
		if (arr.length > 1) {
			this.objectId = arr[arr.length - 2];
			this.hosoService.getItem(+this.objectId).subscribe(res => {
				if (res && res.status === 1) {
					this._user = res.data;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.detechChange.detectChanges();
			});
		}
			
		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.So = '';
		this.gridModel.filterText.NoiCap = '';
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
				name: 'ID_DC',
				displayName: 'ID',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 2,
				name: 'ThongTinThayDoi',
				displayName: 'Thông tin thay đổi',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
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
		this.gridService.cookieName = 'displayedColumnsDinhchinhNCC';
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumnsDinhchinhNCC'));

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
		this.dataSource = new DinhChinhDataSource(this.dinhchinhService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.dinhchinhService.lastFilter$.getValue();
				queryParams.sortField = 'NgayChuyen';
				queryParams.filter.Id_NCC = this.objectId;
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

		this.dinhchinhService.getNCC(+this.objectId).subscribe(res => {
			if (res && res.status === 1) {
				this.ncc = res.data;
			} else {
				this.layoutUtilsService.showError(res.error.message);
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
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.So = this.gridService.model.filterText.So;
			filter.NoiCap = this.gridService.model.filterText.NoiCap;
			filter.Id_NCC = this.objectId;
		}
		return filter;
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
			
			this.dinhchinhService.Delete(item.ID_DC).subscribe(res => {
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
		this.Edit(objectModel, true, false, true);
	}

	Edit(_item: any, allowEdit: boolean = true, allowDuyet: boolean = false, checkTN: boolean = false) {
		_item.Id_NCC = this.objectId;
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DinhchinhthongtinDialogComponent, {
			width: '70vw',
			data: { _item, allowEdit, allowDuyet, checkTN, ncc: this.ncc }
		});
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	print(item: any) {
		this.dinhchinhService.PrintDinhChinh(item.ID_DC).subscribe(res => {
			if (res && res.status == 1) {
				const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
				dialogRef.afterClosed().subscribe(res => {
					if (!res) return;
					this.dinhchinhService.exportDinhChinh(item.ID_DC, item.Id_NCC, res.loai).subscribe(response => {
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
						this.layoutUtilsService.showError("Xuất đính chính thất bại")
					});
				});
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}

	DuyetTin(item: any, val: any) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += 'OBJECT.EDIT.UPDATE_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		var data = new DinhChinhModel();
		data.clear();
		data.ID_NCC = item.Id_NCC;
		data.Id = item.ID_DC;
		data.IsDuyet = val;
		this.dinhchinhService.Approved(data).subscribe(res => {
			if (res && res.status == 1) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(res.error.message);
			}
		})
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

	raQuyetDinh(item: any) {
		let _item: any = {
			ObjectType: 2,
			ObjectId: item.Id,
			Id_NCC: item.Id_NCC
		}
		const dialogRef = this.dialog.open(QuyetDinhEditDialogComponent, { data: { _item, callapi: false } });
		dialogRef.afterClosed().subscribe(respone => {
			if (!respone) return;
			this.dinhchinhService.Duyet(respone).subscribe(res => {
				if (res && res.status == 1) {
					this.layoutUtilsService.showInfo("Tạo quyết định thành công");
					this.ngOnInit();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		});
	}

	Download(item: any) {
		window.open(item, '_blank');
	}
}