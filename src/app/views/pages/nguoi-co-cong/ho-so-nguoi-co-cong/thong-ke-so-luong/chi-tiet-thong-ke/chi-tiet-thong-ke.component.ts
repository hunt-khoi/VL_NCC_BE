import { MatPaginator, MatSort, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, ViewChild, ApplicationRef, Inject, ChangeDetectorRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './../../../services/common.service';
import { TableService } from './../../../../../partials/table/table.service';
import { TableModel } from './../../../../../partials/table/table.model';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { HoSoNCCModule } from './../../ho-so-ncc/ho-so-ncc.module';
import { ThongKeSoLuongService } from './../Services/thong-ke-so-luong.service';
import { ChiTietThongKeDataSource } from '../Model/data-sources/chi-tiet-thong-ke.datasource';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'kt-chi-tiet-thong-ke',
	templateUrl: './chi-tiet-thong-ke.component.html',
})
export class ChiTietThongKeComponent implements OnInit {
	// Table fields
	dataSource: ChiTietThongKeDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	// Filter fields
	filterStatus = '';
	filterType = '';
	filterHoSoDoiTUongNCC = '';
	listHoSoDoiTUongNCC: any[] = [];
	// Selection
	selection = new SelectionModel<HoSoNCCModule>(true, []);
	productsResult: HoSoNCCModule[] = [];

	_name = '';
	objectId = '';
	// khoi tao grildModel
	gridModel: TableModel | undefined;
	gridService: TableService | undefined;
	ncc: any;
	disabledBtn: boolean = false;
	_item: any;

	constructor(
		public dialogRef: MatDialogRef<ChiTietThongKeComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public objectService: ThongKeSoLuongService,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private cookieService: CookieService,
		public changeDetector: ChangeDetectorRef,
		private commonService: CommonService,
		private translate: TranslateService) {
			this._name = this.translate.instant('THONG_KE_NCC.chitietsl');
	}

	/** LOAD DATA */
	ngOnInit() {
		this._item = this.data;
		// filter
		this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
		this.gridModel.filterText.SoHoSo = '';
		this.gridModel.filterText.HoTen = '';
		this.gridModel.filterText.DiaChi = '';
		this.gridModel.filterText.DoiTuong = '';
		this.gridModel.filterText.LoaiHoSo = '';
		this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

		// create availableColumns
		const availableColumns = [
			{
				stt: 0,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: true,
				isShow: true,
			},
			{
				stt: 1,
				name: 'SoHoSo',
				displayName: 'Số hồ sơ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 2,
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
				name: 'NamSinh',
				displayName: 'Năm sinh',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'GioiTinh',
				displayName: 'Giới tính',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 6,
				name: 'DiaChi',
				displayName: 'Địa chỉ',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 7,
				name: 'KhomAp',
				displayName: 'Khóm/ấp',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 8,
				name: 'Title',
				displayName: 'Xã',
				alwaysChecked: false,
				isShow: true,
			},
			{
				stt: 9,
				name: 'DistrictName',
				displayName: 'Huyện',
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
				stt: 11,
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
			{
				stt: 12,
				name: 'strStatus',
				displayName: 'Trạng thái',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 18,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 19,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 20,
				name: 'Deadline',
				displayName: 'Deadline',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 21,
				name: 'UpdatedBy',
				displayName: 'Người cập nhật',
				alwaysChecked: false,
				isShow: false,
			},
			{
				stt: 22,
				name: 'UpdatedDate',
				displayName: 'Ngày cập nhật',
				alwaysChecked: false,
				isShow: false,
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
		this.gridService.cookieName = 'displayedColumns_tkct'
		// apply gridService
		this.gridService.showColumnsInTable();
		this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_tkct'));
		
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
		this.dataSource = new ChiTietThongKeDataSource(this.objectService);
		this.loadDataList();
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			// if (this.productsResult && this.paginator) {
			// 	if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
			// 		this.loadDataList();
			// 	}
			// }
		});
	}

	ngAfterViewChecked() {
		//chặn lỗi ExpressionChangedAfterItHasBeenCheckedError
		this.changeDetector.detectChanges();
	}

	loadDataList() {
		if (!this.sort || !this.dataSource) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
		);
		this.dataSource.loadList(queryParams);
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.loai = this._item.loai;
		filter.Status = this._item.status;
		filter.Id = this._item.item.id;
		filter.IdParent = this._item.IdParent;
		if (this.gridService && this.gridService.model.filterText) {
			filter.DiaChi = this.gridService.model.filterText.DiaChi;
			filter.HoTen = this.gridService.model.filterText.HoTen;
			filter.SoHoSo = this.gridService.model.filterText.SoHoSo;
			filter.DoiTuong = this.gridService.model.filterText.DoiTuong;
			filter.LoaiHoSo = this.gridService.model.filterText.LoaiHoSo;
		}
		return filter;
	}

	ExportExcel() {
		if (!this.paginator || !this.sort || !this.gridService) return;
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
			10,
			{
				headers: headers,
				cols: cols
			},
			true
		);
		this.objectService.exportListDetail(queryParams).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất thống kê không thành công");
		});
	}

	getHeight(): any {
		const obj = window.location.href.split('/').find(x => x == 'tabs-references');
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
	}
	close() {
		this.dialogRef.close();
	}

	click(objectId: number) {
		this.close();
		window.open('/chi-tiet-ho-so/' + objectId, '_blank')
		//this.router.navigateByUrl('/chi-tiet-ho-so/' + objectId);
	}

	print: boolean = false;
	printTicket(print_template: string) {
		this.print = true;
		this.changeDetector.detectChanges();
		let innerContents = document.getElementById(print_template).innerHTML;
		const popupWinindow = window.open();
		if (!popupWinindow) return;
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head><title>' + this._name + '</title></head><body onload="window.print()">' + innerContents + '</html>');
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
				text-align: left;
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