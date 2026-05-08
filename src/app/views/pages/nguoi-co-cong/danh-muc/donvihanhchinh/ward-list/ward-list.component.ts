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
import { CommonService } from '../../../services/common.service';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { donvihanhchinhDataSource } from '../Model/data-sources/donvihanhchinh.datasource';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-ward-list',
	templateUrl: './ward-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class wardListComponent implements OnInit {
	// Table fields
	dataSource: donvihanhchinhDataSource | undefined;
	displayedColumns = ['RowID', 'WardName', "DistrictName", 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterprovinces: number = 0;
	listprovinces: any[] = [];
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
		private danhMucService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
		this._name = this.translate.instant('WARD.NAME');
	}

	ngOnInit() {
		this.danhMucService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.WardName = '';

		const availableColumns = [ 
			{
				stt: 1,
				name: 'RowID',
				displayName: 'Row ID',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'WardName',
				displayName: 'Tên phường xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 5,
				name: 'NguoiCapNhat',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'NgayCapNhat',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: true,
			}
		];

		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

		this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

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
				queryParams = this.apiService.lastFilterXa$.getValue();
				this.dataSource.loadListward(queryParams);
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
		this.dataSource.loadListward(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.WardName = this.gridService.model.filterText.WardName;
		}
		return filter;
	}

	getHeight(): any {
		let tmp_height = 0;
		tmp_height = window.innerHeight - 413;
		return tmp_height + 'px';
	}
}