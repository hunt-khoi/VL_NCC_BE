import { Component, OnInit, ViewChild, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { DanhMucKhacService } from '../Services/danh-muc-khac.service';
import { DanhmucTrocapModel } from '../Models/danh-muc-tro-cap.model';
import { DanhMucTroCapDataSource } from '../Models/data-sources/danh-muc-khac.datasource';
import { TroCapDetailComponent } from './../tro-cap-detail/tro-cap-detail.component';
import { TroCapImportComponent } from '../tro-cap-import/tro-cap-import.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-danh-muc-loai-tro-cap',
	templateUrl: './danh-muc-loai-tro-cap.component.html',
})
export class DanhMucLoaiTroCapComponent implements OnInit {
	// Table fields
	dataSource: DanhMucTroCapDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	productsResult: any[] = [];
	_name = '';
	objectId = '';
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";
	_user: any = {};

	constructor(
		public objectService: DanhMucKhacService,
		private cookieService: CookieService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService) {
		this._name = this.translate.instant("TROCAP.NAME"); 
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.MaTroCap = '';
		this.gridModel.filterText.TroCap = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 0,
				name: 'Id',
				displayName: 'Id',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 1,
				name: 'MaTroCap',
				displayName: 'Mã trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'TroCap',
				displayName: 'Trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'LoaiHoSo',
				displayName: 'Đối tượng NCC',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'TienTroCap',
				displayName: 'Tiền trợ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'PhuCap',
				displayName: 'Phụ cấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: false,
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
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = 'displayedColumns_loaitrocap'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_loaitrocap'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}
			
		// Init DataSource
		this.dataSource = new DanhMucTroCapDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilterTC$.getValue();
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
			filter.MaTroCap = this.gridService.model.filterText.MaTroCap;
			filter.TroCap = this.gridService.model.filterText.TroCap;
			filter.Id_NCC = this.objectId;
		}
		return filter;
	}

	Add() {
		const objectModel = new DanhmucTrocapModel();
		objectModel.clear()
		this.Edit(objectModel);
	}

	Edit(_item: any, allowEdit: boolean = true) {
		_item.Id_NCC = this.objectId;
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(TroCapDetailComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	import() {
		const dialogRef = this.dialog.open(TroCapImportComponent, { width: '80%' });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList();
		});
	}

	delete(item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.deleteTC(item.Id).subscribe(res => {
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
}