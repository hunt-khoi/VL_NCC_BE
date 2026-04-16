import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services

// Models
import { provincesEditDialogComponent } from '../provinces-edit/provinces-edit.dialog.component';
import { provincesModel } from '../Model/donvihanhchinh.model';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-provinces-list',
	templateUrl: './provinces-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class provincesListComponent implements OnInit {
	// Table fields
	dataSource: donvihanhchinhDataSource;
	displayedColumns = ['STT', 'Id_row', 'ProvinceName', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	listchucdanh: any[] = [];
	// Selection
	selection = new SelectionModel<provincesModel>(true, []);
	productsResult: provincesModel[] = [];
	showTruyCapNhanh = true;
	id_menu = 30614;
	_name = '';

	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	constructor(
		public provincesService1: donvihanhchinhService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant('PROVINCE.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();

		//#region ***Filter***
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign(
			{},
			this.gridModel.filterText
		);
		this.gridModel.filterText.ProvinceName = '';

		// displayedColumns = ['STT', 'Id_row', 'ProvinceName', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
		const availableColumns = [
			{
				stt: 1,
				name: 'Id_row',
				displayName: 'ID',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'ProvinceName',
				displayName: 'Tên tỉnh',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'NguoiCapNhat',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NgayCapNhat',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				isShow: true,
			}
		];

		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);

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

		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

		// If the user changes the sort order, reset back to the first page.
		this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
		merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
			.pipe(
				tap(() => {
					this.loadDataList();
				})
			)
			.subscribe();
		// Init DataSource
		this.dataSource = new donvihanhchinhDataSource(this.provincesService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			if (params.id) {
				queryParams = this.provincesService1.lastFilter$.getValue();
				this.restoreState(queryParams, +params.id);
			}
			// First load
			this.dataSource.loadListprovices(queryParams);
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

		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadListprovices(queryParams);
	}
	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService.model.filterText) {
			filter.ProvinceName = this.gridService.model.filterText.ProvinceName;
		}
		return filter;
	}

	/** Delete */
	Delete(_item: provincesModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.provincesService1.deleteProvinces(_item.Id_row).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
					this.loadDataList();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		});
	}
	Add() {
		const provincesModels = new provincesModel();
		provincesModels.clear(); // Set all defaults fields
		this.Update(provincesModels);
	}
	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}
	Update(_item: provincesModel) {
		let saveMessageTranslateParam = '';
		saveMessageTranslateParam += _item.Id_row > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(provincesEditDialogComponent, { data: { _item }, width: '500px' });
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
		let tmp_height = 0;
		tmp_height = window.innerHeight - 341;
		return tmp_height + 'px';
	}
}
