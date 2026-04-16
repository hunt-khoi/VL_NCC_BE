import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
// RXJS
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { ThongKeHoTroService } from '../Services/thong-ke-ho-tro.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { Moment } from 'moment';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ThongKeTongHopDialogComponent } from '../thong-ke-tong-hop-dialog/thong-ke-tong-hop-dialog.component';

@Component({
	selector: 'm-thong-ke-tong-hop',
	templateUrl: './thong-ke-tong-hop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ThongKeTongHopComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	itemForm: FormGroup;

	dataThongKe: any;
	allowExport = false;

	gridModel: TableModel;
	gridService: TableService;

	listHuyen: any[] = []
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number = 0;
	listXa: any[] = [];
	Nam: number = 0;
	loaitk: number = 1;
	quy: number = 1;
	thang: number = 1;
	lstThang = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	to: Moment;
	from: Moment;

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	tsSeparator = "";

	Capcocau: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	style_print: any = {
		td: {
			'border-right': '1px solid #dee2e6',
			'border-bottom': '1px solid #dee2e6',
		},
		th: {
			'border-right': '1px solid #dee2e6',
			'border-bottom': '1px solid #dee2e6',
		},
		table: { 'border': '1px solid #dee2e6' }
	};
	constructor(public tracuuHoSoService: ThongKeHoTroService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.Nam = moment().get("year");
			this.thang = moment().get("month")+1;
			this.quy = moment().quarter();
			this.tsSeparator = CommonService.thousandSeparator;
			this._name = this.translate.instant("Thống kê tổng hợp");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.from = moment(new Date(this.Nam, 0, 1));
		this.to = moment();

		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (this.Capcocau == 2) {
				this.filterDistrict = +res.ID_Goc_Cha;
				this.loadGetListWardByDistrict(this.filterDistrict)
			}
			if (res.Capcocau == 3) {
				this.filterDistrict = +res.ID_Goc_Cha;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
		})
		this.getListHuyen();
	}

	loadData() {
		this.loadGetListWardByDistrict(this.filterDistrict);
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.thongKeTongHop(this.queryParams, this.loaitk).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data;
				this.allowExport = true;
				this.display = true;
			}
			else {
				this.dataThongKe = []
				this.allowExport = false;
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
	}

	getListHuyen() {
		this.display = false
		this.CommonService.GetListDistrictByProvinces(this.filterprovinces).subscribe(res => {			
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	loadGetListWardByDistrict(idDistrict: any) {
		this.CommonService.GetListWardByDistrict(idDistrict).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportTKTongHop(this.queryParams, this.loaitk).subscribe(res => {
			this.loadingSubject.next(false);
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
			this.layoutUtilsService.showError("Xuất thống kê thất bại")
		});
	}

	prepareQuery(): QueryParamsModel {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			'', '', 0, 10,
		);

		return queryParams;
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.filterDistrict > 0)
			filter.Id_Huyen = this.filterDistrict 
		if (this.filterWard > 0)
			filter.Id_Xa = this.filterWard
		
		if (this.loaitk <= 3) {
			filter.Nam = this.Nam
			if (this.loaitk == 2)
				filter.Quy = this.quy
			if (this.loaitk == 3)
				filter.Thang = this.thang
		}
		if (this.loaitk == 5) {
			filter.TuNgay = this.from.format("DD/MM/YYYY")
			filter.DenNgay = this.to.format("DD/MM/YYYY")
		}

		return filter;
	}

	xem(Id_DonVi, status, loaitkCT = 0) {
		let qParams = this.queryParams;
		qParams.filter.Id_DonVi = Id_DonVi;
		qParams.filter.Status = status;
		const dialogRef = this.dialog.open(ThongKeTongHopDialogComponent, { 
			width:'55vw',
			data: { 'queryParams': qParams, 'loaitk': this.loaitk, 'loaitkCT': loaitkCT} 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
		});
	}

	getTitle(status: number) {
		switch(status) {
			case 0:
				return 'Chưa hỗ trợ';
			case 1:
				return 'Đang hỗ trợ';
			case 2:
				return 'Đã hỗ trợ'
		}
	}
}
