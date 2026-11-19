import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { ThoiHanSoLieuService } from '../Services/thoi-han-so-lieu.service';
import { ThoiHanSoLieuDataSource } from '../Model/data-sources/thoi-han-so-lieu.datasource';
import { NhapSoLieuEditDialogComponent } from '../../nhap-so-lieu/nhap-so-lieu-edit/nhap-so-lieu-edit-dialog.component';
import { CookieService } from 'ngx-cookie-service';
import { Moment } from 'moment';
import moment from 'moment';

@Component({
	selector: 'kt-thoi-han-so-lieu-list',
	templateUrl: './thoi-han-so-lieu-list.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThoiHanSoLieuListComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	// Table fields
	dataSource: ThoiHanSoLieuDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	// Selection
	lstStatus: any[] = [];
	_name: string = '';
	// filter District
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict: number = 0;
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];

	IsTre: string = '-1';
	Capcocau: number = 0;
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;

	now = new Date();
	to: Moment = moment(new Date());
	from: Moment = moment(new Date());

	constructor(
		public objectService: ThoiHanSoLieuService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private cookieService: CookieService,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
	}

	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
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

		this.commonService.GetAllProvinces().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listprovinces = res.data;
		});
		this.commonService.getStatusNCC().pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.availableColumns = availableColumns;
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns);

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
		this.dataSource = new ThoiHanSoLieuDataSource(this.objectService);
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadDataList(holdCurrentPage: boolean = true) {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
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
		this.commonService.GetListWardByDistrict(id).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

		if (this.gridService && this.gridService.model.filterText) {
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
		}
		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	getStatusString(status: any) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}

	export() {
		if (!this.gridService || !this.sort || !this.paginator) return;
		let gridService = this.gridService;
		var cols = gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = gridService.model.availableColumns.find(x => x.name == col);
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
		this.objectService.exportList(queryParams).pipe(takeUntil(this.destroy$)).subscribe(response => {
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
		let saveMessageTranslateParam = _item.Id > 0 ? 'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, { name: this._name });
		const dialogRef = this.dialog.open(NhapSoLieuEditDialogComponent, { data: { _item, allowEdit, duyetSoLieu: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadDataList();
			}
		});
	}

	print: boolean = false;
	printTicket(print_template: any) {
		this.print = true;
		let documentPrint = document.getElementById(print_template);
		if (!documentPrint) return;
		let innerContents = documentPrint.innerHTML;
		const popupWinindow = window.open();
		if (!popupWinindow) return;
		popupWinindow.document.open();
		// Gắn tiêu đề và nội dung HTML vào body
		let substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for Deadline">Thời hạn</button>';
		let newstr = '<span aria-label="Change sorting for Deadline">Thời hạn</span>';
		innerContents = innerContents.replace(substr, newstr);
		substr = '<button class="mat-sort-header-button" type="button" aria-label="Change sorting for Nam">Năm</button>';
		newstr = '<span aria-label="Change sorting for Nam">Năm</span>';
		innerContents = innerContents.replace(substr, newstr);
		let title = 'Danh sách số liệu đúng hạn, trễ hạn';
		popupWinindow.document.title = title;
		popupWinindow.document.body.innerHTML = innerContents;
		// Tạo style và đẩy vào Head
		const style = popupWinindow.document.createElement('style');
		style.innerHTML = `
		@media print {
			th:last-child,
			td:last-child,
			.hiden-print {
				display: none !important;
			}
			td {
				border-bottom: 1px solid #dee2e6;
				padding: 10px;
				font-size: 10pt;
				text-align: center;
			}
			th {
				padding: 10px;
				font-size: 12pt;
			}
			table {
				width: 100%;
			}
		}`;
		popupWinindow.document.head.appendChild(style);
	  	// Xử lý sự kiện in
    	popupWinindow.onafterprint = function() { popupWinindow.close(); };
    	popupWinindow.setTimeout(() => popupWinindow.print(), 250); 
		this.print = false;
		this.changeDetectorRefs.detectChanges();
	}
}
