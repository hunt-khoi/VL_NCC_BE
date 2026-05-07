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
import { QuanHeGiaDinhModel } from './../Model/quan-he-gia-dinh.model';
import { QuanHeGiaDinhService } from './../Services/quan-he-gia-dinh.service';
import { QuanHeGiaDinhDataSource } from './../Model/data-sources/quan-he-gia-dinh.datasource';
import { QuanHeGiaDinhEditDialogComponent } from './../quan-he-gia-dinh-edit/quan-he-gia-dinh-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-quan-he-gia-dinh-list',
	templateUrl: './quan-he-gia-dinh-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuanHeGiaDinhListComponent implements OnInit {
	// Table fields
	dataSource: QuanHeGiaDinhDataSource | undefined;
	displayedColumns = ['STT', 'Id', 'QuanHeGiaDinh', 'Priority', 'Locked', 'CreatedBy',
		'CreatedDate', 'UpdatedBy', 'UpdatedDate', 'actions'];
	
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];

	_name = '';
	_QUANHEGIADINH = '';
	_STT = '';
	_LOCKED = '';
	_LOAI = '';
	_PRIORITY = '';
	_CREATEDBY = '';
	_CREATEDDATE = '';
	_UPDATED_BY = '';
	_UPDATED_DATE = '';
	_ACTIONS = '';
	// khoi tao grildModel
	availableColumns: any[] = [];
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";
	selectedTab: number = 0;

	constructor(
		public objectService: QuanHeGiaDinhService,
		public dialog: MatDialog,
		private cookieService: CookieService,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUANHEGIADINH.NAME');
		this._QUANHEGIADINH = this.translate.instant('QUANHEGIADINH.NAME');
		this._LOCKED = this.translate.instant('QUANHEGIADINH.LOCKED');
		this._PRIORITY = this.translate.instant('QUANHEGIADINH.PRIORITY');
		this._ACTIONS = this.translate.instant('COMMON.TACVU');
		this._CREATEDBY = this.translate.instant('QUANHEGIADINH.CREATEDBY');
		this._CREATEDDATE = this.translate.instant('QUANHEGIADINH.CREATEDDATE');
		this._UPDATED_BY = this.translate.instant('COMMON.UPDATED_BY');
		this._UPDATED_DATE = this.translate.instant('COMMON.UPDATED_DATE');
	}

	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}

		this.availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 2,
				name: 'Id',
				displayName: 'Id',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'QHGiaDinh',
				displayName: this._QUANHEGIADINH,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'IsChuYeu',
				displayName: "Là thân nhân chủ yếu",
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'Priority',
				displayName: this._PRIORITY,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Locked',
				displayName: this._LOCKED,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: this._CREATEDBY,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: this._CREATEDDATE,
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: this._UPDATED_BY,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: this._UPDATED_DATE,
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: this._ACTIONS,
				alwaysChecked: true,
				isShow: true,
			}
		];
		this.changeCol();
		
		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
		}

		// Init DataSource
		this.dataSource = new QuanHeGiaDinhDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.objectService.lastFilter$.getValue();
				queryParams.filter.ByQua = this.selectedTab;
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

	changeCol() {
		let cookieName = ""; 
		let index = this.availableColumns.findIndex(x => x.name == 'IsChuYeu');
		if (this.selectedTab == 0 && index < 0) {
			cookieName = "displayedColumns_qhGiaDinh";
			this.availableColumns.push(
				{
					stt: 3,
					name: 'IsChuYeu',
					displayName: "Là thân nhân chủ yếu",
					alwaysChecked: false,
					isShow: true,
				});
		}
		if (this.selectedTab == 1 && index >= 0) {
			this.availableColumns.splice(index, 1);
			cookieName = "displayedColumns_qhGiaDinhQua";
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.QHGiaDinh = '';
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
		this.gridModel.filterGroupDataChecked.IsChuYeu = [
			{
				name: 'Chủ yếu',
				value: 'True',
				checked: false
			},
			{
				name: 'Không chủ yếu',
				value: 'False',
				checked: false
			}
		];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		this.gridModel.availableColumns = this.availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.availableColumns = this.availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.cookieName = cookieName;

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check(cookieName));

		if (this.sort && this.paginator) {
			merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				)
				.subscribe();
		}
	}

	changeTab($event: any) {
		this.selectedTab = $event;
		this.changeCol();
		this.loadDataList(false);
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
		filter.ByQua = this.selectedTab;
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterType && this.filterType.length > 0) {
			filter.type = +this.filterType;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.QHGiaDinh = this.gridService.model.filterText.QHGiaDinh;
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

	Delete(item: QuanHeGiaDinhModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			
			this.objectService.delete(item.Id).subscribe(res => {
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
		const objectModel = new QuanHeGiaDinhModel();
		objectModel.clear(); // Set all defaults fields
		objectModel.ByQua = this.selectedTab == 1;
		this.Edit(objectModel);
	}

	Edit(_item: QuanHeGiaDinhModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(QuanHeGiaDinhEditDialogComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

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

	Lock(item: QuanHeGiaDinhModel, value: boolean = false) {
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
			
			this.objectService.lock(item.Id, value).subscribe(res => {
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