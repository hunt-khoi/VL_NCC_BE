import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { KeHoachVanDongModel } from '../Model/ke-hoach-van-dong.model';
import { KeHoachVanDongService } from '../Services/ke-hoach-van-dong.service';
import { KeHoachVanDongDataSource } from '../Model/data-sources/ke-hoach-van-dong.datasource';
import { KHVanDongEditDialogComponent } from './../ke-hoach-van-dong-edit/ke-hoach-van-dong-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-ke-hoach-van-dong-list',
	templateUrl: './ke-hoach-van-dong-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class KeHoachVanDongListComponent implements OnInit {
	// Table fields
	dataSource: KeHoachVanDongDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	// Selection
	selection = new SelectionModel<KeHoachVanDongModel>(true, []);
	productsResult: KeHoachVanDongModel[] = [];
	_name = '';

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	Capcocau: number;
	ID_Goc_Cha: number;

	constructor(
		public objectService: KeHoachVanDongService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private activateRoute: ActivatedRoute,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = 'Kế hoạch vận động';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.ID_Goc_Cha = res.ID_Goc_Cha;
			//cấp 1 và goc_cha 0 thì ko có quyền thêm
		})

		this.list_button = CommonService.list_button();
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.KeHoach = '';
		this.gridModel.filterText.MoTa = '';

		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 2,
				name: 'KeHoach',
				displayName: 'KeHoach',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 3,
				name: 'Priority',
				displayName: 'Ưu tiên',
				alwaysChecked: false,
				isShow: true,
			},

			{
				stt: 95,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
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
		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

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
		this.gridService.cookieName = 'displayedColumns_kehoachvandong'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_kehoachvandong'));

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
		// Init DataSource
		this.dataSource = new KeHoachVanDongDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.activateRoute.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			// First load
			this.dataSource.loadList(queryParams);
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

	loadDataList(holdCurrentPage: boolean = true) {
		this.selection.clear();
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
		if (this.gridService.model.filterText) {
			filter.KeHoach = this.gridService.model.filterText.KeHoach;
			filter.MoTa = this.gridService.model.filterText.MoTa;
		}
		return filter;
	}

	/** Delete */
	DeleteWorkplace(_item: KeHoachVanDongModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteItem(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	EditObject(_item: KeHoachVanDongModel, allowEdit: boolean = true) {
		let temp: any = Object.assign({}, _item);
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(KHVanDongEditDialogComponent, { data: { _item: temp, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
				this.layoutUtilsService.showInfo(_saveMessage);
			}
		});
	}

	AddWorkplace() {
		const objectModel = new KeHoachVanDongModel();
		objectModel.clear(); // Set all defaults fields
		this.EditObject(objectModel);
	}
}
