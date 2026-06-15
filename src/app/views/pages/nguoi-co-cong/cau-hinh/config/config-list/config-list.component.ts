import { Component, OnInit, OnDestroy, ViewChild, ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from './../../../../../partials/table/table.model';
import { TableService } from './../../../../../partials/table/table.service';
import { CommonService } from '../../../services/common.service';
import { ConfigDataSource } from '../Model/data-sources/config.datasource';
import { ConfigService } from '../Services/config.service';
import { ConfigEditComponent } from '../config-edit/config-edit.component';
import { SysConfigModel } from '../Model/config.model';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-config-list',
	templateUrl: './config-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class ConfigListComponent implements OnInit, OnDestroy {
	// Table fields
	dataSource: ConfigDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;

	IdGroup: number = 0;
	// Selection
	selection = new SelectionModel<SysConfigModel>(true, []);
	configsResult: SysConfigModel[] = [];
	tmpconfigsResult: SysConfigModel[] = [];
	haveFilter: boolean = false;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	list_button: boolean = false;
	btnClass: string = "";
	
	constructor(
		private apiService: ConfigService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private commonService: CommonService) { }

	ngOnInit() {
		this.list_button = CommonService.list_button();
		//#region ***Filter***
		this.gridModel = new TableModel();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['Code'] = "";
		this.gridModel.filterText['Value'] = "";
		this.gridModel.filterText['Description'] = "";
		this.gridModel.filterGroupDataChecked = {};
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		this.apiService.configGroup().subscribe(res => {
			if (!this.gridService) return;
			if (res && res.status == 1) {
				this.gridService.model.filterGroupDataChecked['IdGroup'] = res.data.map((x: any) => {
					return {
						name: x.title,
						value: x.id,
						checked: false
					}
				});
				this.gridService.model.filterGroupDataCheckedFake = Object.assign({}, this.gridService.model.filterGroupDataChecked);
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		});
		//#endregion ***Filter***

		//#region ***Drag Drop***
		let availableColumns = [
			{
				stt: 2,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 3,
				name: 'Code',
				displayName: 'Mã',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 4,
				name: 'Value',
				displayName: 'Giá trị',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 5,
				name: 'IdGroup',
				displayName: 'Nhóm cấu hình',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 6,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 6,
				name: 'Description',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Thao tác',
				alwaysChecked: true,
				isShow: true
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
		//#endregion

		this.commonService.fixedPoint = 0;

		if (!this.sort || !this.paginator) return;
		this.sort.sortChange.subscribe(() => { 
			if (this.paginator) 
				this.paginator.pageIndex = 0; 
		});
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadDataList(true);
				})
			).subscribe();

		// Init DataSource
		this.dataSource = new ConfigDataSource(this.apiService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(params => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadConfigs(queryParams);
			}
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.configsResult = res;
			this.tmpconfigsResult = [];
			if (this.configsResult  && this.paginator) {
				if (this.configsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList();
				} else {
					for (let i = 0; i < this.configsResult.length; i++) {
						let tmpElement = new SysConfigModel();
						tmpElement.copy(this.configsResult[i])
						this.tmpconfigsResult.push(tmpElement);
					}
				}
			}
		});
	}

	ngOnDestroy() {
		if (this.gridService)
			this.gridService.Clear();
	}

	loadDataList(holdCurrentPage: boolean = false) {
		if (!this.sort || !this.paginator || !this.gridService || !this.dataSource) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filter(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData
		);
		this.dataSource.loadConfigs(queryParams);
	}

	filter(): any {
		const filter: any = {};
		if (this.gridService && this.gridService.model.filterText) {
			filter.Code = this.gridService.model.filterText['Code'];
			filter.Value = this.gridService.model.filterText['Value'];
			filter.Description = this.gridService.model.filterText['Description'];
		}
		return filter;
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.configsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.configsResult.forEach(row => this.selection.select(row));
		}
	}

	editConfig(Config: SysConfigModel, allowEdit: boolean = true) {
		const dialogRef = this.dialog.open(ConfigEditComponent, { data: { Config: Config, allowEdit: allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) return;
			this.loadDataList(true);
		});
	}
}