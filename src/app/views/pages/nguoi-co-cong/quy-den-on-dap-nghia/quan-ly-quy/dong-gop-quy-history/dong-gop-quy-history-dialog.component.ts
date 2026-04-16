import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatPaginator } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
// Service
import moment from 'moment';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { TableModel } from 'app/views/partials/table';
import { TableService } from 'app/views/partials/table/table.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { QuanLyQuyDataSource } from '../Model/data-sources/quan-ly-quy.datasource';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { DongGopQuyModel } from '../Model/dong-gop-quy.model';
import { CookieService } from 'ngx-cookie-service';
import { DongGopQuyEditDialogComponent } from '../dong-gop-quy-edit/dong-gop-quy-edit-dialog.component';

@Component({
	selector: 'm-dong-gop-quy-history-dialog',
	templateUrl: './dong-gop-quy-history-dialog.component.html',
})

export class DongGopQuyHistoryDialogComponent implements OnInit {

	item: DongGopQuyModel;
	hasFormErrors = false;
	viewLoading = false;
	selected: any[] = [];
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	Nam: number;
	_name = '';
	UserInfo: any;
	Id_DonVi: number = 0;
	isngoaiKH: number = 0;

	// Table fields
	dataSource: QuanLyQuyDataSource;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	selection = new SelectionModel<DongGopQuyModel>(true, []);

	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;

	constructor(
		public dialogRef: MatDialogRef<DongGopQuyHistoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		public commonService: CommonService,
		public objectService: QuanLyQuyService,
		private cookieService: CookieService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private activateRoute: ActivatedRoute,
		private ref: ApplicationRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = 'Chi tiết đóng góp quỹ';
			this.Nam = moment().get("year");
	}
	/** LOAD DATA */
	ngOnInit() {
		let item = this.data._item;
		if (item.Id != undefined) {
			this.Id_DonVi = item.Id
		}
		if (item.Nam != undefined) {
			this.Nam = +item.Nam
		}
		if (this.data.isngoaiKH != undefined) {
			this.isngoaiKH = this.data.isngoaiKH;
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);

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
				name: 'SoTien',
				displayName: 'Số tiền',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 10,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: true,
				isShow: true
			},
			{
				stt: 11,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: true,
				isShow: true
			},
			{
				stt: 12,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: true,
				isShow: true
			},
			{
				stt: 13,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: true,
				isShow: true
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
			queryParams.filter.Nam = this.Nam
			queryParams.filter.Id_DonVi = this.Id_DonVi
			if (this.isngoaiKH)
				queryParams.filter.IsNgoaiKH = "1"
			// First load
			this.dataSource.loadListLSDongGop(queryParams);
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
		this.dataSource.loadListLSDongGop(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.Nam = this.Nam
		filter.Id_DonVi = this.Id_DonVi
		if (this.isngoaiKH)
			filter.IsNgoaiKH = "1";
		return filter;
	}

	/** UI */
	getTitle(): string {
		return this._name;
	}

	closeForm() {
		this.dialogRef.close();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	DeleteWorkplace(_item) {
		let _name = "Đóng góp quỹ";
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.DeleteDongGop(_item.Id).subscribe(res => {
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

	// EditObject(_item: any) {
	// 	let temp: any = Object.assign({}, _item);
	// 	const dialogRef = this.dialog.open(DongGopQuyEditDialogComponent, { data: { _item: temp } });
	// 	dialogRef.componentInstance.IsSua = true;
	// 	dialogRef.afterClosed().subscribe(res => {
	// 		if (!res) {
	// 		} else {
	// 			this.loadDataList();
	// 			this.layoutUtilsService.showInfo("Cập nhật thành công");
	// 		}
	// 	});
	// }

	updateSoTien(row) {
		let item = Object.assign({}, row);
		this.objectService.UpdateGopQuy(item).subscribe(res => {
			if (res && res.status == 1) {
				this.loadDataList();
				this.layoutUtilsService.showInfo("Cập nhật số tiền thành công");
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	xuatDanhSach() {
		const filter: any = {};
		filter.Nam = this.Nam
		filter.Id_DonVi = this.Id_DonVi
		if (this.isngoaiKH)
			filter.IsNgoaiKH = "1";
		

		this.objectService.export_DGQ_history(new QueryParamsModel(filter)).subscribe(res => {
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

	updateSL(item: any, event: any) {
		item.SoTien = +event.target.value.replace(/\./g, ''); // replace(/./g, ''): not working
	}

	checkValue(e: any) {
		if (!((e.keyCode >= 48 && e.keyCode <= 57) || e.keyCode == 46)
			|| (e.keyCode >= 96 && e.keyCode <= 105)) { 
			e.preventDefault();
		}
	}
}
