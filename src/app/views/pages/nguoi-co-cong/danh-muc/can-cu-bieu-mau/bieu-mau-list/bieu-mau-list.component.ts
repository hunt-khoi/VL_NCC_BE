import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { ActivatedRoute } from '@angular/router';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatMenuTrigger, MatDialog } from '@angular/material';
import { TokenStorage } from './../../../../../../core/auth/_services/token-storage.service';
import { loaiDieuDuongModel } from './../../loai-dieu-duong/Model/loaidieuduong.model';
import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { BieuMauService } from '../services/bieu-mau.service';
import { CanCuBieuMauDataSource } from '../Models/data-sources/can-cu-bieu-mau.datasource';
import { CanCuService } from '../services/can-cu.service';
import { BieuMauEditDialogComponent } from '../bieu-mau-edit/bieu-mau-edit.dialog.component';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-bieu-mau-list',
	templateUrl: './bieu-mau-list.component.html'
})
export class BieuMauListComponent implements OnInit {
	dataSource: CanCuBieuMauDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger;

	// Filter fields
	curUser: any = {};
	// Selection
	selection = new SelectionModel<loaiDieuDuongModel>(true, []);
	productsResult: loaiDieuDuongModel[] = [];
	_name: string = "";
	gridService: TableService;
	girdModel: TableModel = new TableModel();
	lstLoai: any[] = [];
	list_button: boolean;
	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private TokenStorage: TokenStorage,
		private translate: TranslateService,
		private cookieService: CookieService,
		private bmService: BieuMauService,
		private ccService: CanCuService,
		private commonService: CommonService
	) {
		this._name = this.translate.instant("BIEUMAU.NAME");
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.girdModel.haveFilter = true;
		this.girdModel.tmpfilterText = Object.assign({}, this.girdModel.filterText);
		this.girdModel.filterText['So'] = "";
		this.girdModel.filterText['BieuMau'] = "";
		this.girdModel.filterText['Version'] = "";

		let optionsTinhTrang = [
			{
				name: 'Chưa có hiệu lực',
				value: 'null',
			},
			{
				name: 'Hiệu lực',
				value: 'True',
			},
			{
				name: 'Hết hiệu lực',
				value: 'False',
			}
		];

		this.girdModel.filterGroupDataChecked['IsHieuLuc'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
		});

		this.girdModel.filterGroupDataCheckedFake = Object.assign({}, this.girdModel.filterGroupDataChecked);
		this.commonService.liteCanCu().subscribe(res => {
			if (res && res.status == 1) {
				let lst = res.data.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataChecked['SoCanCu'] = lst;
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})
		this.commonService.ListLoaiBieuMau().subscribe(res => {
			if (res && res.status == 1) {
				this.lstLoai = res.data;
				this.gridService.model.filterGroupDataChecked['Loai'] = this.lstLoai.map(x => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
		})

		//#region ***Drag Drop***
		let availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 2,
				name: 'So',
				displayName: 'Số',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 3,
				name: 'BieuMau',
				displayName: 'Biểu mẫu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Version',
				displayName: 'Phiên bản',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'Loai',
				displayName: 'Nhóm',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'SoCanCu',
				displayName: 'Căn cứ',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 4,
				name: 'HieuLuc_From',
				displayName: 'Hiệu lực từ',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 5,
				name: 'HieuLuc_To',
				displayName: 'Hiệu lực đến',
				alwaysChecked: false,
				isShow: false
			},
			{

				stt: 6,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 7,
				name: 'IsHieuLuc',
				displayName: 'Có hiệu lực',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 10,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			},
		];
		this.girdModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.girdModel.selectedColumns = new SelectionModel<any>(true, this.girdModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService, 
			this.ref, 
			this.girdModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_bieumau1'

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_bieumau1'));


		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		this.dataSource = new CanCuBieuMauDataSource(this.bmService, this.ccService);
		this.route.queryParams.subscribe(params => {
			let queryParams = this.bmService.lastFilter$.getValue();
			// First load
			this.dataSource.loadListBieuMau(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
	}

	ngOnDestroy() {
		this.gridService.Clear();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadListBieuMau(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.So = this.gridService.model.filterText['So'];
			filter.BieuMau = this.gridService.model.filterText['BieuMau'];
			filter.Version = this.gridService.model.filterText['Version'];
		}
		return filter;
	}

	Add() {
		let _item: any = { Id: 0, Version: '1.0.0', content: '$', isTinh: true, isHuyen: false, isXa: false }; //ko tự check huyện, xã
		this.Edit(_item);
	}

	Edit(_item, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(BieuMauEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}
	delete(_item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.bmService.Delete(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	getItemCssClassByStatus(status: boolean): string {
		if (status == null)
			return '';
		switch (status) {
			case true:
				return 'kt-badge--success';
			case false:
				return 'kt-badge--metal';
		}
	}

	getItemStatusString(status: boolean): string {
		if (status == null)
			return 'Chưa có hiệu lực'
		switch (status) {
			case true:
				return 'Hiệu lực';
			case false:
				return 'Hết hiệu lực';
		}
	}

	getLoai(loai) {
		let find = this.lstLoai.find(x => x.id == loai);
		if (find)
			return find.title;
		return '';
	}

	download(danhmuckhac) {
		let IdTemplate = danhmuckhac.Id;
		//this.bmService.previewByTemplate(IdTemplate).subscribe(res => {
		//	if (res && res.status == 1) {
		//		const dialogRef = this.dialog.open(ReviewExportComponent, { data: res.data });
		//		dialogRef.afterClosed().subscribe(res => {
		//			if (!res) {
		//			} else {
		//				this.bmService.exportByTemplate(IdTemplate, res.loai).subscribe(response => {
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

		this.bmService.download(IdTemplate).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}
}
