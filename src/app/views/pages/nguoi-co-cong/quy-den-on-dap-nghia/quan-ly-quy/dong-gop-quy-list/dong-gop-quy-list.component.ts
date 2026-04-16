import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Route } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as moment from 'moment';

import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { DongGopQuyModel } from '../Model/dong-gop-quy.model';
import { QuanLyQuyDataSource } from '../Model/data-sources/quan-ly-quy.datasource';
import { DongGopQuyHistoryDialogComponent } from '../dong-gop-quy-history/dong-gop-quy-history-dialog.component';
import { DongGopQuyEditDialogComponent } from './../dong-gop-quy-edit/dong-gop-quy-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'm-dong-gop-quy-list',
	templateUrl: './dong-gop-quy-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DongGopQuyListComponent implements OnInit {
	
	// Table fields
	dataSource: QuanLyQuyDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;

	// Selection
	selection = new SelectionModel<DongGopQuyModel>(true, []);
	productsResult: DongGopQuyModel[] = [];
	_name = '';

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
	Capcocau: number;
	Nam: number;
	IsNgoaiKH: boolean = false;

	constructor(
		public objectService: QuanLyQuyService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private activateRoute: ActivatedRoute,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		public commonService: CommonService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = 'Quản lý đóng góp quỹ';
			this.Nam = moment().get("year");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
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
		this.gridModel.filterText.DonVi = '';

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
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'Nam',
				displayName: 'Năm',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'TienVanDong',
				displayName: 'Tiền vận động',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 6,
				name: 'TienDongGop',
				displayName: 'Tiền đóng góp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'PTHoanThanh',
				displayName: 'PT so với vận động',
				alwaysChecked: false,
				isShow: true,
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

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumns();

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
			queryParams.filter.Nam =  this.Nam
			// First load
			this.dataSource.loadListVanDong(queryParams);
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
		this.dataSource.loadListVanDong(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.IsNgoaiKH)
			filter.IsNgoaiKH = "1";
		filter.Nam = this.Nam;
		if (this.gridService.model.filterText) {
			filter.DonVi = this.gridService.model.filterText.DonVi;
		}
		return filter;
	}

	/** Delete */
	DeleteWorkplace(_item: DongGopQuyModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			// this.objectService.deleteItem(_item.Id).subscribe(res => {
			// 	if (res && res.status === 1) {
			// 		this.layoutUtilsService.showInfo(_deleteMessage);
			// 	} else {
			// 		this.layoutUtilsService.showError(res.error.message);
			// 	}
			// 	this.loadDataList();
			// });
		});
	}

	EditObject(_item: DongGopQuyModel) {
		let temp: any = Object.assign({}, _item);
		const dialogRef = this.dialog.open(DongGopQuyEditDialogComponent, { data: { _item: temp } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.loadDataList();
				this.layoutUtilsService.showInfo("Đóng góp thành công");
			}
		});
	}

	ChuyenVaoKeHoach(id: number) {
		const _title = this.translate.instant('Chuyển vào kế hoạch');
		const _description = this.translate.instant('Bạn có chắc muốn chuyển đóng góp đơn vị vào kế hoạch năm');
		const _waitDesciption = this.translate.instant('Đang xử lý...');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.ChuyenVaoKeHoach(id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo("Chuyển vào kế hoạch vận động năm thành công");
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadDataList();
			});
		});
	}

	ViewHistory(item) {
		let temp: any = Object.assign({}, item);
		let isngoaiKH = this.IsNgoaiKH;
		const dialogRef = this.dialog.open(DongGopQuyHistoryDialogComponent, { data: { _item: temp, isngoaiKH } });
		dialogRef.afterClosed().subscribe(res => {
			this.loadDataList();
		});
	}

	AddWorkplace() {
		const objectModel = new DongGopQuyModel();
		objectModel.clear(); // Set all defaults fields
		this.EditObject(objectModel);
	}

	getColorProgressBar(pt: number) {
		if (pt < 30) {
			return 'danger';
		}
		else if (pt >= 30 && pt < 80) {
			return 'warning';
		}
		else {
			return 'success';
		}
	}

	getColor(pt: number) {
		if (pt < 30) {
			return 'red';
		}
		else if (pt >= 30 && pt < 80) {
			return 'orange';
		}
		else {
			return 'green';
		}
	}
	xuatDanhSach() {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
		);
		this.objectService.export_DGQ(queryParams).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất đóng góp quỹ thất bại");
		});
	}
}
