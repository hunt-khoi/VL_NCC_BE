import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { DienChinhHinhModel } from './../Model/dien-chinh-hinh.model';
import { DienChinhHinhService } from './../Services/dien-chinh-hinh.service';
import { DienChinhHinhDataSource } from './../Model/data-sources/dien-chinh-hinh.datasource';
import { DienChinhHinhEditDialogComponent } from './../dien-chinh-hinh-edit/dien-chinh-hinh-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-dien-chinh-hinh-list',
	templateUrl: './dien-chinh-hinh-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DienChinhHinhListComponent implements OnInit {
	// Table fields
	dataSource: DienChinhHinhDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';
	// Selection
	selection = new SelectionModel<DienChinhHinhModel>(true, []);
	productsResult: DienChinhHinhModel[] = [];

	_name = '';
	_DIENCHINHHINH = '';
	_STT = '';
	_MOTA = '';
	_LOCKED = '';
	_LOAI = '';
	_PRIORITY = '';
	_CREATEDBY = '';
	_CREATEDDATE = '';
	_UPDATED_BY = '';
	_UPDATED_DATE = '';
	_ACTIONS = '';
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";

	constructor(
		public apiService: DienChinhHinhService,
		public dialog: MatDialog,
		private cookieService: CookieService,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService) {
		this._name = this.translate.instant('DIENCHINHHINH.NAME');
		this._DIENCHINHHINH = this.translate.instant('DIENCHINHHINH.NAME');
		this._MOTA = this.translate.instant('DIENCHINHHINH.MOTA');
		this._LOAI = this.translate.instant('DIENCHINHHINH.LOAI');
		this._LOCKED = this.translate.instant('DIENCHINHHINH.LOCKED');
		this._PRIORITY = this.translate.instant('DIENCHINHHINH.PRIORITY');
		this._ACTIONS = this.translate.instant('COMMON.TACVU');
		this._STT = this.translate.instant('COMMON.STT');
		this._CREATEDBY = this.translate.instant('DIENCHINHHINH.CREATEDBY');
		this._CREATEDDATE = this.translate.instant('DIENCHINHHINH.CREATEDDATE');
		this._UPDATED_BY = this.translate.instant('COMMON.UPDATED_BY');
		this._UPDATED_DATE = this.translate.instant('COMMON.UPDATED_DATE');
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.apiService !== undefined) {
			this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.DienChinhHinh = '';
		this.gridModel.filterText.MoTa = '';
		this.gridModel.filterText.Locked = '';
		this.gridModel.filterGroupDataChecked.Locked = [
			{
				name: 'Đã khóa',
				value: 'True',
				checked: false
			},
			{
				name: 'Hoạt động',
				value: 'False',
				checked: false
			}
		];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DienChinhHinh',
				displayName: this._DIENCHINHHINH,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Priority',
				displayName: this._PRIORITY,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'Locked',
				displayName: this._LOCKED,
				alwaysChecked: false,
				isShow: true,
			},

			{
				stt: 5,
				name: 'MoTa',
				displayName: this._MOTA,
				alwaysChecked: false,
				isShow: true,
			}, {
				stt: 7,
				name: 'CreatedBy',
				displayName: this._CREATEDBY,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 8,
				name: 'CreatedDate',
				displayName: this._CREATEDDATE,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'UpdatedBy',
				displayName: this._UPDATED_BY,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'UpdatedDate',
				displayName: this._UPDATED_DATE,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: this._ACTIONS,
				alwaysChecked: false,
				isShow: false,
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
		this.gridService.cookieName = 'displayedColumns_dienchinhhinh'
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_dienchinhhinh'));

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
		this.dataSource = new DienChinhHinhDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
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
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterType && this.filterType.length > 0) {
			filter.type = +this.filterType;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DienChinhHinh = this.gridService.model.filterText.DienChinhHinh;
			filter.MoTa = this.gridService.model.filterText.MoTa;
		}
		return filter;
	}

	getItemStatusString(status: boolean = true): string {
		switch (status) {
			case true:
				return 'Khóa';
			case false:
				return 'Hoạt động';
		}
	}

	getItemCssClassByStatus(status: boolean = true): string {
		switch (status) {
			case true:
				return 'kt-badge--metal';
			case false:
				return 'kt-badge--success';
		}
	}

	Delete(item: DienChinhHinhModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;

			this.apiService.Delete(item.Id).subscribe(res => {
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
		const dataModel = new DienChinhHinhModel();
		dataModel.clear(); // Set all defaults fields
		this.Edit(dataModel);
	}

	Edit(_item: DienChinhHinhModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(DienChinhHinhEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	Lock(item: DienChinhHinhModel, value: boolean = false) {
		let _message = item.Locked ? 'Mở khóa thành công' : 'Khóa thành công';
		let _title;
		let _description;
		let _waitDesciption;
		if (!item.Locked) {
			_title = this.translate.instant('OBJECT.LOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.LOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.LOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		} else {
			_title = this.translate.instant('OBJECT.UNLOCK.TITLE', { name: this._name.toLowerCase() });
			_description = this.translate.instant('OBJECT.UNLOCK.DESCRIPTION', { name: this._name.toLowerCase() });
			_waitDesciption = this.translate.instant('OBJECT.UNLOCK.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		}
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.apiService.Lock(item.Id, value).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_message);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}
}