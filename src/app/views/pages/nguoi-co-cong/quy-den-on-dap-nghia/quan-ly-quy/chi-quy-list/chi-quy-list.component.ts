import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Route } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Moment } from 'moment';
import * as moment from 'moment';
// Services
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { ChiQuyModel, QDChiModel } from '../Model/dong-gop-quy.model';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { QuanLyQuyDataSource } from '../Model/data-sources/quan-ly-quy.datasource';
import { ChiQuyEditDialogComponent } from '../chi-quy-edit/chi-quy-edit-dialog.component';
import { ChiQuyChiDialogComponent } from '../quyet-dinh-chi-quy/quyet-dinh-chi-quy.dialog.component';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-chi-quy-list',
	templateUrl: './chi-quy-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ChiQuyListComponent implements OnInit {
	// Table fields
	dataSource: QuanLyQuyDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	// Selection
	selection = new SelectionModel<ChiQuyModel>(true, []);
	productsResult: ChiQuyModel[] = [];
	_name = '';

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	Capcocau: number;
	ID_Goc_Cha: number;
	IsChiHoTro: boolean = false;
	pipe = new DatePipe('en-US');
	to: Moment;
	from: Moment;

	constructor(
		public objectService: QuanLyQuyService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private activateRoute: ActivatedRoute,
		private ref: ApplicationRef,
		public commonService: CommonService,
		private cookieService: CookieService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = 'chi quỹ';
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date());

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.ID_Goc_Cha = res.ID_Goc_Cha;
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

		this.pushColumn();

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
		this.dataSource = new QuanLyQuyDataSource(this.objectService);
		let queryParams = new QueryParamsModel({});

		// Read from URL itemId, for restore previous state
		this.activateRoute.queryParams.subscribe(params => {
			queryParams = this.objectService.lastFilter$.getValue();
			queryParams.filter.TuNgay = this.pipe.transform(this.from.toDate(), 'dd/MM/yyyy');
			queryParams.filter.DenNgay = this.pipe.transform(this.to.toDate(), 'dd/MM/yyyy');

			// First load
			this.dataSource.loadListChiQuy(queryParams);
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

	pushColumn() {
		let availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: true,
				isShow: true,
			},	
			{
				stt: 2,
				name: 'SoTien',
				displayName: 'Số tiền',
				alwaysChecked: false,
				isShow: true,
			},	
			{
				stt: 4,
				name: 'NoiDung',
				displayName: 'Nội dung',
				alwaysChecked: false,
				isShow: true,
			},	
			{
				stt: 5,
				name: 'IsTuNguonTren',
				displayName: 'Từ nguồn cấp trên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'GhiChu',
				displayName: 'Ghi chú',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'SoQD',
				displayName: 'Số quyết định',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'CreatedBy',
				displayName: this.translate.instant('COMMON.CREATED_BY'),
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 96,
				name: 'CreatedDate',
				displayName: this.translate.instant('COMMON.CREATED_DATE'),
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 97,
				name: 'UpdatedBy',
				displayName: this.translate.instant('COMMON.UPDATED_BY'),
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'UpdatedDate',
				displayName: this.translate.instant('COMMON.UPDATED_DATE'),
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

		if (this.IsChiHoTro) {
			availableColumns = [
				{
					stt: 1,
					name: 'STT',
					displayName: 'STT',
					alwaysChecked: true,
					isShow: true,
				},	
				{
					stt: 2,
					name: 'SoTien',
					displayName: 'Số tiền',
					alwaysChecked: false,
					isShow: true,
				},	
				{
					stt: 4,
					name: 'QuyDenOnCon',
					displayName: 'Quỹ đền ơn con',
					alwaysChecked: false,
					isShow: true,
				},		
				{
					stt: 95,
					name: 'CreatedBy',
					displayName: this.translate.instant('COMMON.CREATED_BY'),
					alwaysChecked: false,
					isShow: true,
				},
				{
					stt: 96,
					name: 'CreatedDate',
					displayName: this.translate.instant('COMMON.CREATED_DATE'),
					alwaysChecked: false,
					isShow: true,
				},
				// {
				// 	stt: 97,
				// 	name: 'UpdatedBy',
				// 	displayName: this.translate.instant('COMMON.UPDATED_BY'),
				// 	alwaysChecked: false,
				// 	isShow: false,
				// },
				// {
				// 	stt: 98,
				// 	name: 'UpdatedDate',
				// 	displayName: this.translate.instant('COMMON.UPDATED_DATE'),
				// 	alwaysChecked: false,
				// 	isShow: false,
				// },
				// {
				// 	stt: 99,
				// 	name: 'actions',
				// 	displayName: 'Tác vụ',
				// 	alwaysChecked: true,
				// 	isShow: true,
				// }
			];
		}

		this.gridModel.availableColumns = availableColumns.sort(
			(a, b) => a.stt - b.stt
		);
		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns.clear();
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
		
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();
	}

	change() {
		this.pushColumn();
		this.loadDataList();
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
		this.dataSource.loadListChiQuy(queryParams, this.IsChiHoTro);
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.TuNgay = this.pipe.transform(this.from.toDate(), 'dd/MM/yyyy');
		filter.DenNgay = this.pipe.transform(this.to.toDate(), 'dd/MM/yyyy');
		if (this.IsChiHoTro)
			filter.IsChiHoTro = "1";
		return filter;
	}

	/** Delete */
	DeleteWorkplace(_item: ChiQuyModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteChiQuy(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo("Xóa thành công");
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	EditObject(_item: ChiQuyModel, allowEdit: boolean=true) {
		let temp: any = Object.assign({}, _item);
		const dialogRef = this.dialog.open(ChiQuyEditDialogComponent, { data: { _item: temp, allowEdit: allowEdit, IsHoTro: this.IsChiHoTro} });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
				this.layoutUtilsService.showInfo("Chi quỹ thành công");
			}
		});
	}

	modelChanged(event){
		this.from = event;
		this.loadDataList();
		
	}

	modelChanged1(event){
		this.to = event;
		this.loadDataList();
	}

	raQuyetDinh(_item: QDChiModel) {
		const dialogRef = this.dialog.open(ChiQuyChiDialogComponent, { data: { _item: _item } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.loadDataList();
			}
			else
			{
				this.layoutUtilsService.showInfo('Ra quyết định chi thành công');
				this.loadDataList();
			}

		});
 	}

	 inQuyetDinh (id) {
		this.objectService.downloadQD(id).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất quyết định thất bại");
		});
	}

	AddWorkplace() {
		const objectModel = new ChiQuyModel();
		objectModel.clear(); // Set all defaults fields
		this.EditObject(objectModel);
	}
	Export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols
			},
			true
		);
		this.objectService.exportChiQuy(queryParams, this.IsChiHoTro).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		},
		err => {
			this.layoutUtilsService.showError("Xuất chi quỹ thất bại");
		});
		
	}
}
