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
	selector: 'm-bao-cao-theo-nd-chi',
	templateUrl: './bao-cao-theo-nd-chi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoTheoNDChiComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any = { data: [], ChiTiet: [] };
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
	nam: number;
	lstThang = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 

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
			this._name = this.translate.instant("Báo cáo theo nội dung chi");
			this.tsSeparator = commonService.thousandSeparator;
			this.nam = moment().get("year");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
		})
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.baoCaoNoiDungChi(this.queryParams).subscribe(res => {
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

	getValue(item, thang) {
		let find = item.Thangs.find(x => x.Thang == thang);
		if (find != null) {
			return find["SoTien"] == '0' ? '0' : this.commonService.f_currency_V2(find["SoTien"]);
		}
		return '0';
	}

	sumTong(item) {
		var sum = 0;
		item.Thangs.forEach(x => {
			sum += x.SoTien
		});
		return this.commonService.f_currency_V2(sum.toString());
	}

	getValueHuyen(item, thang: number = 0, isCurrency = true) {
		var sum = 0;
		for (var i = 0; i < item.ThongKes.length; i++) {
			var tk = item.ThongKes[i];
			tk.Thangs.forEach(x => {
				if (thang == 0) 
					sum += x.SoTien
				if (x.Thang == thang)
					sum += x.SoTien
			});
		}
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTongHuyen(thang: number = 0, isCurrency = true) {
		var sum = 0;
		for (var i = 0; i < this.dataThongKe.ChiTiet.length; i++) {
			var huyen = this.dataThongKe.ChiTiet[i];
			sum += this.getValueHuyen(huyen, thang, false);
		}
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	getValueTinh(thang: number = 0, isCurrency = true) {
		var sum = 0;
		for (var i = 0; i < this.dataThongKe.data.length; i++) { 
			var tk = this.dataThongKe.data[i]
			tk.Thangs.forEach(x => {
				if (thang == 0) 
					sum += x.SoTien
				if (x.Thang == thang)
					sum += x.SoTien
			});
		}
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTongCong(thang: number = 0) {
		var tong = this.getValueTinh(thang, false) + this.sumTongHuyen(thang, false);
		return this.commonService.f_currency_V2(tong.toString());
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCNoiDungChi(this.queryParams).subscribe(res => {
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
		filter.Nam = this.nam
		return filter;
	}
}