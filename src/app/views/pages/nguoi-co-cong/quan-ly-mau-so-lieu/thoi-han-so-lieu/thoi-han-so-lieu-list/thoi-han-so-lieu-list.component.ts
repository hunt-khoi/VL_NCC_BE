import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { Moment } from 'moment';
import * as moment from 'moment';
import { CommonService } from '../../../services/common.service';
import { ThoiHanSoLieuService } from '../Services/thoi-han-so-lieu.service';
import { ThoiHanSoLieuDataSource } from '../Model/data-sources/thoi-han-so-lieu.datasource';
import { NhapSoLieuEditDialogComponent } from '../../nhap-so-lieu/nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-thoi-han-so-lieu-list',
	templateUrl: './thoi-han-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThoiHanSoLieuListComponent implements OnInit {
	// Table fields
	dataSource: ThoiHanSoLieuDataSource;

	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	// Filter fields
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];
	// tslint:disable-next-line:variable-name
	_name = '';
	// filter District
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];

	IsTre: string = '-1';
	Capcocau: number;
	// khoi tao grildModel
	gridModel: TableModel;
	gridService: TableService;

	now = new Date();
	to: Moment;
	from: Moment;

	constructor(
		public objectService: ThoiHanSoLieuService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage,
		private router: Router) {
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		this.selection = new SelectionModel<any>(true, []);
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (this.Capcocau == 2) {
				this.filterDistrictID(res.ID_Goc_Cha);
			}
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.commonService.getStatusNCC().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
			}
		});

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.DistrictID = this.filterdistrict;

		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);
		// create availableColumns
		const availableColumns = [
			{
				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
				name: 'MauSoLieu',
				displayName: 'Mẫu số liệu',
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
				name: 'DonVi',
				displayName: 'Đơn vị',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'Status',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 12,
				name: 'Deadline',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 95,
				name: 'NguoiGui',
				displayName: 'Người gửi',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 96,
				name: 'SentDate',
				displayName: 'Ngày gửi',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 97,
				name: 'NguoiXuLy',
				displayName: 'Người xử lý',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 98,
				name: 'CheckDate',
				displayName: 'Ngày xử lý',
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
		this.gridService.cookieName = 'displayedColumns_thsl'

		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_thsl'));

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
		this.dataSource = new ThoiHanSoLieuDataSource(this.objectService);

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

	filterDistrictID(id: any) {
		this.filterdistrict = id;
		this.filterward = '';
		this.commonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.IsTre) {
			if (this.IsTre == "0") {
				filter.Status = '2';
				filter.IsTre = false;
			}
			if (this.IsTre == "1") {
				filter.Status = '2';
				filter.IsTre = true;
			}
			if (this.IsTre == "2") {
				filter.Status = '1';
				filter.IsTre = true;
			}
			if (this.IsTre == "3") {
				filter.Status = '1';
				filter.IsTre = false;
			}
			if (this.IsTre == "-1") {
				filter.Status = '0';
				filter.IsTre = '0'
			}
		}
		else {
			this.layoutUtilsService.showError("Hãy chọn tình trạng thống kê")
			return;
		}
		if (this.from)
			filter["TuNgay"] = this.from.format("DD/MM/YYYY");
		if (this.to)
			filter["DenNgay"] = this.to.format("DD/MM/YYYY");
		if (this.filterdistrict > 0)
			filter.DistrictID = +this.filterdistrict;
		if (this.filterward)
			filter.Id_Xa = +this.filterward;

		if (this.gridService.model.filterText) {
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
		}

		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	restoreState(queryParams: QueryParamsModel, id: number) {
		if (id > 0) {
		}

		if (!queryParams.filter) {
			return;
		}
	}

	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}

	export() {
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'actions');
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
		this.objectService.exportList(queryParams).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại");
		});
	}
	EditObject(_item: any, allowEdit: boolean = true) {
		let saveMessageTranslateParam = '';
		// câu thông báo khi thực hiện trong tác vụ
		saveMessageTranslateParam += _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NhapSoLieuEditDialogComponent, { data: { _item, allowEdit, duyetSoLieu: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}

		});
	}
	print: boolean = false;
	printTicket(print_template) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();

		let innerContents = document.getElementById(print_template).innerHTML;
		let substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for Deadline">Thời hạn</button>';
		let newstr = '<span aria-label="Change sorting for Deadline">Thời hạn</span>';
		innerContents = innerContents.replace(substr, newstr);
		let title = 'Danh sách số liệu đúng hạn, trễ hạn';
		substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for Nam">Năm</button>';
		newstr = '<span aria-label="Change sorting for Nam">Năm</span>';
		innerContents = innerContents.replace(substr, newstr);
		const popupWinindow = window.open();
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>'+title+'</title></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print {
			th:last-child,
			td:last-child,
			.hiden-print {
				display: none !important;
			}
			td{
				border-bottom: 1px solid #dee2e6;
				padding: 10px;
				font-size: 10pt;
				text-align: center;
			}
			th{
				padding: 10px;
				font-size: 12pt;
			}
			table{
				width: 100%;
			}
		}
		</style>
	  `);
	  	popupWinindow.document.close();
		popupWinindow.onafterprint = window.close;
		  this.print = false;
	 }

}
