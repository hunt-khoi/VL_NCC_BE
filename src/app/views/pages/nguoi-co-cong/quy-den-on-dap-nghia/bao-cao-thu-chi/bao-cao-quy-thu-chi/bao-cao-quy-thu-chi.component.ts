import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { BaoCaoThuChiService } from '../Services/bao-cao-thu-chi.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import moment from 'moment';

@Component({
	selector: 'm-bao-cao-quy-thu-chi',
	templateUrl: './bao-cao-quy-thu-chi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoQuyThuChiComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any = { Tinhs: [], data: [] };
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
	lstTieuDe = [
		{
			id: 'A.',
			title: 'TỔNG THU',
			col: 'TienThu',
			col_sum: 'TongThu'
		},
		{
			id: 'B.',
			title: 'TỔNG CHI',
			col: 'TienChi',
			col_sum: 'TongChi'
		},
		{
			id: 'C.',
			title: 'TỒN QUỸ',
			col: 'TienTon',
			col_sum: 'TonQuy'
		},
	]

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
			this._name = this.translate.instant("Báo cáo thu chi quỹ năm");
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
		this.lstTinhMonth = { 'TienThu': [], 'TienChi': [], 'TienTon': [] }
		this.lstSumTinh = { 'TongThu': 0, 'TongChi': 0, 'TonQuy': 0 }
		this.tracuuHoSoService.baoCaoQuyThuChi(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.display = true;
				this.mapHuyen();
				this.mapTinh();
			}
			else {
				this.dataThongKe = []
				this.allowExport = false;
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	filterHuyen(): any {
		const filter: any = {};
		filter.ProvinceID = this.filterprovinces;
		return filter
	}

	lstTinhMonth: any = { 'TienThu': [], 'TienChi': [], 'TienTon': [] }
	lstSumTinh: any = { 'TongThu': 0, 'TongChi': 0, 'TonQuy': 0 }
	mapTinh() {
		let dtTinh = this.dataThongKe.Tinhs[0];
		this.lstTieuDe.forEach(x => {
			this.lstThang.forEach(y => {
				if (dtTinh) {
					let find = dtTinh.Thangs.find(x => x.Thang == y);
					if (find != null) 
						this.lstTinhMonth[x.col].push(+find[x.col])
					else
						this.lstTinhMonth[x.col].push(0)
				} else {
					this.lstTinhMonth[x.col].push(0)
				}
			});
			this.lstSumTinh[x.col_sum] = dtTinh ? dtTinh[x.col_sum] : 0;
		})
	}


	lstHuyenMonth: any = { 'TienThu': {}, 'TienChi': {}, 'TienTon': {} }
	lstSumHuyen: any = { 'TongThu': {}, 'TongChi': {}, 'TonQuy': {} }
	mapHuyen() {
		this.lstTieuDe.forEach(x => {
			this.dataThongKe.data.forEach(y => {
				var flag = false;
				if (y.Quys.length == 0) flag = true;
				var arrtmp: any[] = []
				this.lstThang.forEach(z => { 
					if (flag) {
						arrtmp.push(0);
					}
					else {
						let find = y.Quys[0].Thangs.find(x => x.Thang == z);
						if (find != null) 
							arrtmp.push(+find[x.col])
						else
							arrtmp.push(0)
					}
				})
				this.lstHuyenMonth[x.col][y.Id_Huyen] = arrtmp
				this.lstSumHuyen[x.col_sum][y.Id_Huyen] = flag ? 0 : y.Quys[0][x.col_sum]
			});
		})
	}

	sumValueH (t, str, isCurrency = true) {
		let sum = 0;
		var obj = this.lstHuyenMonth[str];
		Object.keys(obj).forEach(key => {
			sum += obj[key][t-1];
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTongH (str, isCurrency = true) {
		let sum = 0;
		var obj = this.lstSumHuyen[str];
		Object.keys(obj).forEach(key => {
			sum += obj[key];
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTong (str) {
		var tmp = this.sumTongH(str, false) + this.lstSumTinh[str]
		return this.commonService.f_currency_V2(tmp.toString());
	}

	sumValueTong (t, str) {
		var sumT = this.lstTinhMonth[str].length > 0 ? this.lstTinhMonth[str][t-1] : 0;
		var tmp = this.sumValueH(t, str, false) + sumT
		return this.commonService.f_currency_V2(tmp.toString());
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCThuChi(this.queryParams).subscribe(res => {
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