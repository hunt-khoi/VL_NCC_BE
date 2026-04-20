import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { TableService } from '../../../../../partials/table/table.service';
import { TableModel } from '../../../../../partials/table/table.model';
import { BaoCaoThongKeDataSource } from '../Model/data-sources/bao-cao-thong-ke.datasource';
import { BaoCaoThongKeService } from '../Services/bao-cao-thong-ke.service';
import { CookieService } from 'ngx-cookie-service';
import { Moment } from 'moment';
import moment from 'moment';

@Component({
	selector: 'kt-bao-cao-thong-ke-view',
	templateUrl: './bao-cao-thong-ke-view.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BaoCaoThongKeViewComponent implements OnInit {
	// Table fields
	dataSource: BaoCaoThongKeDataSource| undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';

	// Selection
	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	filterward = '';
	listward: any[] = [];
	Capcocau: number = 0;

	// khởi tạo grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	DateKey: string = 'SentDate';
	now = new Date();
	to: Moment | undefined;
	from: Moment | undefined;
	list_button: boolean = false;

	constructor(
		public objectService: BaoCaoThongKeService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private layoutUtilsService: LayoutUtilsService,
		private cookieService: CookieService,
		private changeDetectorRefs: ChangeDetectorRef,
		private ref: ApplicationRef,
		private commonService: CommonService,
		private translate: TranslateService,
		private tokenStorage: TokenStorage) {
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
		this.list_button = CommonService.list_button();
		this.selection = new SelectionModel<any>(true, []);
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			if (res.Capcocau == 2) {
				this.Capcocau = res.Capcocau;
				this.filterdistrict = '' + res.ID_Goc_Cha;
				this.commonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listward = res.data;
				})
			}
		})
		if (this.objectService !== undefined) {
			this.objectService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'SoHoSo', 0, 10));
		}

		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.LoaiHoSo = '';
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterGroupDataChecked['TinhTrang'] = [{
			name: 'Đã duyệt',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa duyệt',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataChecked['IsTre_Duyet'] = [{
			name: 'Trễ hạn',
			value: 'True',
			checked: false
		}, {
			name: 'Chưa trễ hạn',
			value: 'False',
			checked: false
		}];
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		let availableColumns = [
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
				displayName: 'Số Hồ Sơ',
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
				stt: 10,
				name: 'DoiTuong',
				displayName: 'Đối tượng',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 11,
				name: 'LoaiHoSo',
				displayName: 'Loại hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			//{
			//	stt: 11,
			//	name: 'TinhTrang',
			//	displayName: 'Tình trạng',
			//	alwaysChecked: false,
			//	isShow: false,
			//},
			//{
			//	stt: 13,
			//	name: 'IsTre',
			//	displayName: 'Trễ hạn',
			//	alwaysChecked: false,
			//	isShow: true,
			//},
			{
				stt: 13,
				name: 'IsTre',
				displayName: 'Thời hạn',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 14,
				name: 'NguoiThoCungLietSy',
				displayName: 'Người thờ cúng liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 15,
				name: 'QuanHeVoiLietSy',
				displayName: 'Quan hệ với liệt sỹ',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 91,
				name: 'SentBy',
				displayName: 'Người gửi',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 92,
				name: 'NgayGui',
				displayName: 'Ngày gửi',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 93,
				name: 'Checker',
				displayName: 'Người hoàn tất',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 94,
				name: 'CheckDate',
				displayName: 'Ngày hoàn tất',
				alwaysChecked: false,
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
		this.gridService.cookieName = 'displayedColumns_hosotk'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_hosotk'));

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
		this.dataSource = new BaoCaoThongKeDataSource(this.objectService);
		this.route.queryParams.subscribe(_ => {
			this.loadDataList(false);
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
		this.loadDataList();
		this.commonService.GetListWardByDistrict(id).subscribe(res => {
			if (res && res.status == 1)
				this.listward = res.data;
		})
	}

	filterWardID(id: any) {
		this.filterward = id;
		this.loadDataList();
	}

	filterConfiguration(): any {
		const filter: any = { DateKey: this.DateKey, Status: 2 };
		if (this.from)
			filter["TuNgay"] = this.from.format("DD/MM/YYYY");
		if (this.to)
			filter["DenNgay"] = this.to.format("DD/MM/YYYY");
		if (this.filterdistrict) {
			filter.DistrictID = +this.filterdistrict;
		}
		if (this.filterward) {
			filter.Id_Xa = +this.filterward;
		}
		if (this.gridService && this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.LoaiHoSo = this.gridService.model.filterText.LoaiHoSo;
		}
		return filter;
	}

	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.filter(row => !row.IsEnable_Duyet).length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				if (!row.IsEnable_Duyet)
					this.selection.select(row)
			});
		}
	}

	export() {
		if (!this.paginator || !this.sort || !this.dataSource || !this.gridService) return;
		var cols = this.gridService.model.displayedColumns.filter(x => x != 'STT' && x != 'select' && x != 'actions');
		var headers: string[] = [];
		cols.forEach(col => {
			var f = this.gridService.model.availableColumns.find(x => x.name == col);
			headers.push(f.displayName);
		});
		let queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			1,
			this.paginator.pageSize,
			{
				headers: headers,
				cols: cols.map(x => {
					if (x == 'NgayGui')
						return 'SentDate';
					else if (x == 'IsTre')
						return 'Deadline';
					else
						return x;
				})
			},
			true
		);
		queryParams.filter.Status = 2;
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
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại")
		});
	}

	print: boolean = false;
	printTicket(print_template: any) {
		this.print = true;
		this.changeDetectorRefs.detectChanges();
		let title = 'Thống kê hồ sơ người có công đã duyệt';
		let innerContents = document.getElementById(print_template).innerHTML;
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