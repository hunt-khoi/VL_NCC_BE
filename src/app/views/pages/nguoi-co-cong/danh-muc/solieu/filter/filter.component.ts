import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { filterEditComponent } from '../filter-edit/filter-edit.component';
import { FilterDataSource } from '../Model/data-sources/filter.datasource';
import { FilterModel } from '../Model/filter.model';
import { filterService } from '../Services/filter.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-filter',
	templateUrl: './filter.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class FilterComponent implements OnInit {

	// Table fields
	dataSource: FilterDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	filterStatus = '';
	filterCondition = '';
	// Selection
	selection = new SelectionModel<FilterModel>(true, []);
	productsResult: FilterModel[] = [];
	_name = "";

	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	list_bang: any[] = [
		{ id: 'tbl_ncc', title: 'Người có công' },
		{ id: 'tbl_doituongnhanqua', title: 'Quà lễ tết' },
	];

	constructor(public filterService1: filterService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = 'Trích xuất';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		if (this.filterService1 !== undefined) {
			this.filterService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'title', 0, 10));
		} //mặc định theo priority

		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText['title'] = "";

		this.gridModel.filterGroupDataChecked['bang'] = this.list_bang.map(x => {
			return {
				name: x.title,
				value: x.id,
				checked: false
			}
		});
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

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
				name: 'title',
				displayName: 'Tên bộ trích xuất',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 3,
				name: 'bang',
				displayName: 'Nguồn dữ liệu',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 8,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 9,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: true
			},
			{
				stt: 10,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 11,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: false
			},
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)


		this.gridService = new TableService(this.layoutUtilsService, this.ref, this.gridModel, this.cookieService);

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
		this.dataSource = new FilterDataSource(this.filterService1);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.route.queryParams.subscribe(params => {
			queryParams = this.filterService1.lastFilter$.getValue();
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
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,
			this.gridService.model.filterGroupData  //phải có mới filter theo group
		);
		this.dataSource.loadList(queryParams);
	}
	filterConfiguration(): any {

		const filter: any = {};
		if (this.gridService.model.filterText)
			filter.title = this.gridService.model.filterText['title'];

		return filter; //trả về đúng biến filter
	}

	/** Delete */
	DeleteWorkplace(_item: FilterModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.filterService1.Delete_filter(_item.id_row).subscribe(res => {
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


	AddWorkplace() {
		const FilterModels = new FilterModel();
		FilterModels.clear(); // Set all defaults fields
		this.EditNhom(FilterModels);
	}

	EditNhom(_item: FilterModel, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		//câu thông báo khi thực hiện trong tác vụ
		saveMessageTranslateParam += _item.id_row > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(filterEditComponent, { data: { _item, allowEdit } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}

	getStringBang(bang) {
		return this.list_bang.find(x => x.id == bang).title;
	}
}
