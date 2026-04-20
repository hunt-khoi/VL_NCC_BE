import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { ThoiHanService } from '../Services/thoi-han.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { ThoiHanDataSource } from '../Model/data-sources/thoi-han.datasource';
import { Moment } from 'moment';
import moment from 'moment';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-thoi-han-list',
	templateUrl: './thoi-han-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThoiHanListComponent implements OnInit {
	// Table fields
	dataSource: ThoiHanDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	lstStatus: any[] = [];

	// filter District
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];

	IsTre: string = '-1';
	lstDoiTuongNCC: any[] = [];
	Id_DoiTuongNCC: string = '';
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	now = new Date();
	to: Moment | undefined;
	from: Moment | undefined;
	list_button: boolean | undefined;

	constructor(public objectService: ThoiHanService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) { }

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		//tmp=tmp.set('date', 1);
		//this.from = tmp;
		//this.to = moment();
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
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			if (res && res.status == 1)
				this.lstDoiTuongNCC = res.data;
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
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
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
				name: 'SoHoSo',
				displayName: 'Sổ Hồ Sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 3,
				name: 'HoTen',
				displayName: 'Họ tên',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 4,
				name: 'NgaySinh',
				displayName: 'Ngày sinh',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 5,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'KhomAp',
				displayName: 'Khóm/ấp ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'Title',
				displayName: 'Phường/Xã ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'DistrictName',
				displayName: 'Quận/Huyện',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 9,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'LoaiHoSo',
				displayName: 'Loại hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 10,
				name: 'NguoiThoCungLietSy',
				displayName: 'Người thờ cúng liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 11,
				name: 'QuanHeVoiLietSy',
				displayName: 'Quan hệ với liệt sỹ',
				alwaysChecked: false,
				isShow: false,
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
				name: 'SentBy',
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
				name: 'CheckBy',
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
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
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
		this.gridService.cookieName = 'displayedColumns_thoihan'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_thoihan'));

		if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

		// Init DataSource
		this.dataSource = new ThoiHanDataSource(this.objectService);
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
		if (this.Id_DoiTuongNCC)
			filter.Id_DoiTuongNCC = +this.Id_DoiTuongNCC;

		if (this.gridService && this.gridService.model.filterText) {
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

	getStatusString(status: any) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f) return "";
		return f.data.color;
	}

	in(id: any, loai: any, isThannhan: boolean = false) {
		const filter: any = {};
		filter.loai = loai;
		filter.isThannhan = isThannhan;
		this.objectService.exportHS(id, filter).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}

	export() {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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
				cols: cols.map(x => {
					return x == 'Status' ? 'strStatus' : x;
				})
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
			this.layoutUtilsService.showError("Xuất danh sách thất bại")
		});
	}

	print: boolean = false;
	printTicket(print_template: any) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();
		let title = this.translate.instant('THONG_KE_NCC.tkthoihan');
		let innerContents = document.getElementById(print_template).innerHTML;
		let substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for HoTen">Họ tên</button>';
		let newstr = '<span class="mat-sort-header-button" aria-label="Change sorting for HoTen">Họ tên</span>';
		innerContents = innerContents.replace(substr, newstr);
		substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for Deadline">Thời hạn</button>';
		newstr = '<span class="mat-sort-header-button" aria-label="Change sorting for HoTen">Thời hạn</span>';
		innerContents = innerContents.replace(substr, newstr);
		const popupWinindow = window.open();
		if (!popupWinindow) return;
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
			}
			th{
				padding: 10px;
				font-size: 12pt;
			}
			
		}
		</style>
	  `);
	  	popupWinindow.document.close();
		popupWinindow.onafterprint = window.close;
		  this.print = false;
	 }
}
