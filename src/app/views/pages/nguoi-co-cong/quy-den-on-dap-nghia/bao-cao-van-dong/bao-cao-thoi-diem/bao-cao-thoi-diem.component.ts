import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { BaoCaoVanDongService } from '../../bao-cao-van-dong/Services/bao-cao-thang.service'
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { FormControl } from '@angular/forms';
import { Moment } from 'moment';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import moment from 'moment';
import { BaoCaoVanDongModel } from '../Model/bao-cao-van-dong.model';

@Component({
	selector: 'm-bao-cao-thoi-diem',
	templateUrl: './bao-cao-thoi-diem.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoThoiDiemComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";

	data : BaoCaoVanDongModel;
	to: Moment;
	from: Moment;
	date: any;
	dataThongKe: any;
	allowExport = false;

	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	Capcocau: number;
	tsSeparator = "";

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
	constructor(public tracuuHoSoService: BaoCaoVanDongService,
		public commonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant("Báo cáo kế hoạch vận động đến thời điểm");
		this.tsSeparator = commonService.thousandSeparator;
	}

	/** LOAD DATA */
	ngOnInit() {
		this.date = new FormControl(moment());
		this.data = new BaoCaoVanDongModel();
		this.data.clear();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (this.Capcocau == 2) {
				this.filterDistrict = +res.ID_Goc_Cha;
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
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.baoCaoVanDongThoiDiem(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				let t = res.data;

				this.data.TongDV = t.TongDV;
				this.data.TongDVC = t.TongDVC;
				this.data.TongGiaoVanDongDuoc = t.TongGiaoVanDongDuoc;
				this.data.TongTuVanDongDuoc = t.TongTuVanDongDuoc;
				this.data.TongVanDong = t.TongVanDong;
				this.data.tong_KHCT = t.tong_KHCT;

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

	replace(value) {
		if(!value) return 0;
		let result = Math.round(value * 1000) / 1000 ; // làm tròn 3 chữ số sau dấu phẩy
		return result.toString().replace('.', ',')
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCVanDongThoiDiem(this.queryParams).subscribe(res => {
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
		filter.Ngay = this.date.value.format("YYYY/MM/DD");
		return filter;
	}
	
}