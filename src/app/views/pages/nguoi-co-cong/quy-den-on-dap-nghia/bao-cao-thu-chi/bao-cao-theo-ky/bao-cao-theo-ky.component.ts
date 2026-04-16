import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { BaoCaoThuChiService } from '../Services/bao-cao-thu-chi.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import moment from 'moment';

@Component({
	selector: 'm-bao-cao-theo-ky',
	templateUrl: './bao-cao-theo-ky.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoTheoKyComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any = { CapDuois: [], data: [] };
	allowExport = false;

	listTinh: any[] = []
	listHuyen: any[] = []
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;

	Capcocau: number;
	tsSeparator = "";
	Nam: number;
	loaitk: number = 1;
	quy: number = 1;
	thang: number = 1;
	lstThang = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	col = 1; 
	
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

	constructor(public tracuuHoSoService: BaoCaoThuChiService,
		private commonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = this.translate.instant("Báo cáo theo vận động - chi theo kỳ");
			this.tsSeparator = commonService.thousandSeparator;
			this.Nam = moment().get("year");
			this.thang = moment().get("month")+1;
			this.quy = moment().quarter();
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.col = this.Capcocau == 1 ? 3 : (this.Capcocau == 2 ? 2 : 1)
			this.filterprovinces = res.IdTinh;
		})
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.baoCaoTheoKy(this.queryParams, this.loaitk).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.display = true;
			}
			else {
				this.dataThongKe = []
				this.allowExport = false;
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	hiddenExport() {
		this.display = false
		this.allowExport = false;
	}

	filterHuyen(): any {
		const filter: any = {};
		filter.ProvinceID = this.filterprovinces;
		return filter
	}

	getValue(str, isCurrency=true) {
		var kq = this.dataThongKe.data[str]
		return isCurrency ? this.commonService.f_currency_V2(kq.toString()) : kq;
	}
	getValueCapDuoi(str, cap, isCurrency=true) {
		let kq = 0;
		var find = this.dataThongKe.CapDuois.find(x => x.CapQuy == cap)
		if (find) {
			kq = find[str];
		}
		return isCurrency ? this.commonService.f_currency_V2(kq.toString()) : kq;
	}

	sumValue() {
		var sum = this.getValue("TonTrucTiep", false) + this.getValue("TienVDTrongKy", false) 
			- this.getValue("TienSDTrongKy", false);
		return this.commonService.f_currency_V2(sum.toString())
	}

	sumValueCapDuoi(cap) {
		var sum = this.getValueCapDuoi("TonTrucTiep", cap, false) + this.getValueCapDuoi("TienVDTrongKy", cap, false) 
			- this.getValueCapDuoi("TienSDTrongKy", cap, false);
		return this.commonService.f_currency_V2(sum.toString())
	}

	sumValue2() {
		var sum = this.getValue("TonGianTiep", false) + this.getValue("TienHTTrongKy", false) 
			- this.getValue("TienSDTuTren", false);
		return this.commonService.f_currency_V2(sum.toString())
	}

	sumCap(str, isCurrency=true) {
		let sum = this.dataThongKe.data[str]
		this.dataThongKe.CapDuois.forEach(x => {
			sum += x[str];
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTongCap(str1, str2, isCurrency=true) {
		let datatk = this.dataThongKe;
		let sum = datatk.data[str1] + datatk.data[str2]
		datatk.CapDuois.forEach(x => {
			sum += x[str1];
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	tienKySauCap() {
		var sum = this.sumCap("TonTrucTiep", false) + this.sumCap("TienVDTrongKy", false) 
			- this.sumCap("TienSDTrongKy", false);
		return this.commonService.f_currency_V2(sum.toString())
	}

	tienKySauTongCap() {
		var sum = this.sumTongCap("TonTrucTiep", "TonGianTiep", false) + this.sumTongCap("TienVDTrongKy", "TienHTTrongKy", false) 
			- this.sumTongCap("TienSDTrongKy", "TienSDTuTren", false);
		return this.commonService.f_currency_V2(sum.toString())
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCTheoKy(this.queryParams, this.loaitk).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại");
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
		filter.Nam = this.Nam
		if (this.loaitk == 2)
			filter.Quy = this.quy
		if (this.loaitk == 3)
			filter.Thang = this.thang
			
		return filter;
	}
}