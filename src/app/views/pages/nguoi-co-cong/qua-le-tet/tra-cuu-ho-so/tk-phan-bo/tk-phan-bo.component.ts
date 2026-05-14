import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';

@Component({
	selector: 'm-tk-phan-bo',
	templateUrl: './tk-phan-bo.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class TKPhanBoComponent implements OnInit {
	_name = "";
	dataThongKe: any = { data: [] };
	display: boolean = false;
	hideEmptyRows: boolean = false;

	get donvisFiltered(): any[] {
		if (!this.dataThongKe || !this.dataThongKe.Donvis) return [];
		if (!this.hideEmptyRows) return this.dataThongKe.Donvis;
		return this.dataThongKe.Donvis.filter((item: any) => +item.NhieuMuc_SL !== 0);
	}
	filterprovinces: number = 0;
	filterWard: number = 0;

	viewLoading: boolean = false;
	queryParams: QueryParamsModel = new QueryParamsModel({});
	Capcocau: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	IdDotTangQua: number = 0;
	lstDot: any[] = [];
	IdNguon: number = 0;
	lstNguon: any[] = [];

	TongNhieuMuc_SL: number = 0;
	TongNhieuMuc_Tien: number = 0;
	strMuc = "";

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
	
	constructor(public apiService: tracuuHoSoService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.tkphanbo');
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (res.Capcocau == 3) { //xã
				this.filterWard = +res.ID_Goc;
			}
		})
		this.CommonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
		this.CommonService.liteNguonKinhPhi(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstNguon = res.data;
		})
	}

	onToggleHideEmpty() {
		this.changeDetectorRefs.detectChanges();
	}

	loadData() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		if (this.IdNguon <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn nguồn kinh phí");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuu();
	}

	tracuu() {
		this.display = false;
		this.loadingSubject.next(true);
		this.TongNhieuMuc_SL = 0;
		this.TongNhieuMuc_Tien = 0;
		this.apiService.thongKePhanBo(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe = res.data;
				this.dataThongKe.Donvis.forEach((x: any) => {
					this.TongNhieuMuc_SL += +x.NhieuMuc_SL;
					this.TongNhieuMuc_Tien += +x.NhieuMuc_Tien;
				})
				this.strMuc = "";
				for (var i = 0; i < this.dataThongKe.data.length; i++) {
					var muc = this.dataThongKe.data[i];
					this.strMuc += (this.strMuc == "" ? "" : " và ") + muc.MucQua + "đ";
				}
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	getValue(dv: any, item: any) {
		let find = item.ThongKe.find((x: any) => +x.Id == +dv);
		if (find != null)
			return find.SL;
		return '';
	}

	getTong(dv: any, index: any, isTien: any) {
		let find = this.dataThongKe.Tongs[index].data.find((x: any) => +x.Id == +dv);
		if (find != null)
			return isTien ? this.CommonService.f_currency_V2(find.TongTien) : find.TongSL;
		return '0';
	}

	export() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		if (this.IdNguon <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn nguồn kinh phí");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.loadingSubject.next(true);
		this.apiService.exportTKPhanBo(this.queryParams).subscribe(res => {
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
		const queryParams = new QueryParamsModel(this.filter(), '', '', 0, 10);
		return queryParams;
	}

	filter(): any {
		const filter: any = {};
		filter.IdDot = this.IdDotTangQua;
		filter.IdNguon = this.IdNguon;
		return filter;
	}
}