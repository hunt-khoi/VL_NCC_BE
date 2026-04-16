import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ThongKeNhapSoLieuService } from '../Services/thong-ke-nhap-so-lieu.service';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import * as moment from 'moment';
import { Moment } from 'moment'
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-tong-hop',
	templateUrl: './tong-hop.component.html',
})

export class TongHopComponent implements OnInit {

	hasFormErrors = false;
	viewLoading = false;
	listDetail: any[] = [];
	listNhapSoLieuDetail: any[] = [];
	listNhapSoLieuDetailChild: any[] = [];
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false; // cho phép sửa
	allowDetail = false;
	isZoomSize = false;
	mauSoLieuSelected: number = 0;
	DonVis: any[] = [];
	_name = '';
	allowExport = false;
	theo: number = 3;
	thang: number;
	quy: number;
	nam: number;
	to: Moment;
	from: Moment;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	dv: number = 0;
	listCachNhap: any[] = [];
	ChuaDuyet: boolean = false;
	IsMauTheoPhong: boolean = false;
	IsDefault: boolean = false;
	Capcocau: number;
	IsDVPhong: boolean = false;

	FilterCtrl_mau: string = '';
	listMauSoLieu: any[] = [];
	listMauSL$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl_dv: string = '';
	lstDV: any[] = [];
	lstDV$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	constructor(
		public dialog: MatDialog,
		private commonService: CommonService,
		private objectService: ThongKeNhapSoLieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('MAU_SO_LIEU.nhapsl');
	}
	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})
		this.loadListCachNhap();
		let tmp = moment();
		this.nam = tmp.get("year");
		this.thang = new Date().getMonth() + 1;
		this.quy = tmp.quarter();

		this.change();
		this.bindNgay();
	}

	filter() {
		if (!this.listMauSoLieu) {
			return;
		}
		let search = this.FilterCtrl_mau;
		if (!search) {
			this.listMauSL$.next(this.listMauSoLieu.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listMauSL$.next(
			this.listMauSoLieu.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter1() {
		if (!this.lstDV) {
			return;
		}
		let search = this.FilterCtrl_mau;
		if (!search) {
			this.lstDV$.next(this.lstDV.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.lstDV$.next(
			this.lstDV.filter(ts =>
				ts.Title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	loadListCachNhap() {
		this.commonService.liteCachNhap().subscribe(res => {
			this.listCachNhap = res.data;
			this.changeDetectorRefs.detectChanges()
		});
	}

	getStrCachNhap(cachnhap: any): string {
		for (const cn of this.listCachNhap) {
			if (cn.id == +cachnhap) {
				return cn.title;
			}
		}
	}

	change() {
		this.mauSoLieuSelected = 0;
		this.commonService.liteMauSoLieu(true, this.IsMauTheoPhong).subscribe(res => {
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.listMauSoLieu = res.data;
				this.listMauSL$.next(this.listMauSoLieu);
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
		this.listDetail = [];
	}

	bindNgay() {
		if (this.theo == 1) {
			//tháng
			let thang = +this.thang - 1;
			this.from = moment(new Date(this.nam, thang, 1));
			this.to = moment(new Date(this.nam, thang + 1, 0));
		}
		if (this.theo == 2) {
			//quý
			let thang1, thang2;
			switch (this.quy) {
				case 1: thang1 = 0; thang2 = 2; break;
				case 2: thang1 = 3; thang2 = 5; break;
				case 3: thang1 = 6; thang2 = 8; break;
				case 4: thang1 = 9; thang2 = 11; break;
			}
			this.from = moment(new Date(this.nam, thang1, 1));
			this.to = moment(new Date(this.nam, thang2 + 1, 0));
		}
		if (this.theo == 3) {
			//năm
			this.from = moment(new Date(this.nam, 0, 1));
			this.to = moment(new Date(this.nam, 11, 31));
		}
		this.listDetail = [];
		this.lstDV = [];
		if (!this.IsDefault) {
			this.objectService.getDV(this.filterConfiguration()).subscribe(res => {
				if (res && res.status == 1) {
					this.lstDV = res.data;
					this.lstDV$.next(this.lstDV);
				}
			})
		}
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.tktonghop');
	}

	filterConfiguration(): any {
		const filter: any = { 
			id: this.mauSoLieuSelected, 
			dv: this.dv, 
			ChuaDuyet: this.ChuaDuyet ? "1" : "0", 
			IsDVPhong: (this.IsDVPhong && this.dv==0) ? "1": "0",
			IsDefault: this.IsDefault
		};
		if (this.from)
			filter["TuNgay"] = this.from.format("DD/MM/YYYY");
		if (this.to)
			filter["DenNgay"] = this.to.format("DD/MM/YYYY");
		return filter;
	}

	loadData() {
		if (this.mauSoLieuSelected == 0) {
			this.layoutUtilsService.showError("Vui lòng chọn mẫu số liệu");
			return;
		}
		if (this.theo == 3 && (this.nam <= 0 || this.nam == undefined)) {
			this.layoutUtilsService.showError("Vui lòng nhập năm");
			return;
		}

		this.loadingSubject.next(true);
		this.objectService.tongHop(this.filterConfiguration()).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.listDetail = res.data.SoLieu;
				this.DonVis = res.data.DonVis;
				this.allowExport = true;
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		});
	}

	in() {
		if (this.mauSoLieuSelected == 0) {
			this.layoutUtilsService.showError("Vui lòng chọn mẫu số liệu");
			return;
		}
		if (this.nam < 0) {
			this.layoutUtilsService.showError("Vui lòng nhập năm");
			return;
		}
		this.loadingSubject.next(true);
		this.objectService.xuatTongHop(this.filterConfiguration()).subscribe(res => {
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
}
