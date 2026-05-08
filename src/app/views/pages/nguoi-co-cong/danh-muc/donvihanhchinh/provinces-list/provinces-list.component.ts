import { Component, OnInit, ViewChild, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-provinces-list',
	templateUrl: './provinces-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class provincesListComponent implements OnInit {
	// Table fields
	dataSource: donvihanhchinhDataSource | undefined;
	displayedColumns = ['STT', 'Id_row', 'ProvinceName', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	listchucdanh: any[] = [];
	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	_name = '';

    gridService: TableService | undefined;
    gridModel: TableModel | undefined;

	constructor(
		public apiService: donvihanhchinhService,
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
		//#region ***Filter***
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.ProvinceName = '';

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

		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
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
		//#endregion

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
		this.dataSource = new donvihanhchinhDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadListprovices(queryParams);
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
			this.paginator.pageSize
		);
		this.dataSource.loadListprovices(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.ProvinceName = this.gridService.model.filterText.ProvinceName;
		}
		return filter;
	}

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 341;
		return tmp_height + 'px';
	}
}