import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ThongKeNhapSoLieuService } from '../Services/thong-ke-nhap-so-lieu.service';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-theo-giai-doan',
	templateUrl: './theo-giai-doan.component.html',
})
export class TheoGiaiDoanComponent implements OnInit {

	hasFormErrors = false;
	viewLoading = false;
	listDetail: any[] = [];
	listNhapSoLieuDetail: any[] = [];
	listNhapSoLieuDetailChild: any[] = [];
	loadingAfterSubmit = false;
	disabledBtn = false;
	listCachNhap: any[] = [];
	allowEdit = false; // cho phép sửa
	allowDetail = false;
	isZoomSize = false;
	mauSoLieuSelected: number = 0;
	Nams: any[] = [];
	_name = '';
	allowExport = false;
	isTrongPhamVi = true;
	nam1: number;
	nam2: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	dv: number = 0;
	ChuaDuyet: boolean = false;
	IsMauTheoPhong: boolean = false;
	IsDefault: boolean = false;

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
		private translate: TranslateService) {
		this._name = this.translate.instant('MAU_SO_LIEU.nhapsl');
	}
	/** LOAD DATA */
	ngOnInit() {
		this.loadListCachNhap();
		this.nam2 = new Date().getFullYear();
		this.nam1 = new Date().getFullYear() - 1;
		this.change();
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
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.tktheogiaidoan');
	}

	bindNgay() {
		this.listDetail = [];
		this.dv = 0;
		this.lstDV = [];
		this.objectService.getDV(this.filterConfiguration()).subscribe(res => {
			if (res && res.status == 1) {
				this.lstDV = res.data;
				this.lstDV$.next(this.lstDV);
			}
		})
	}

	filterConfiguration(): any {
		const filter: any = { id: this.mauSoLieuSelected, dv: this.dv, ChuaDuyet: this.ChuaDuyet ? "1" : "0" };
		filter["TuNgay"] = "01/01/" + this.nam1;
		filter["DenNgay"] = "31/12/" + this.nam2;
		filter.nam1 = this.nam1;
		filter.nam2 = this.nam2;
		filter.isTrongPhamVi = this.isTrongPhamVi ? "1" : "0";
		return filter;
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

	loadData() {
		if (this.nam1 <= 0 || this.nam1 == undefined) {
			this.layoutUtilsService.showError("Vui lòng nhập năm chính xác");
			return;
		}

		if (this.nam2 <= 0 || this.nam2 == undefined) {
			this.layoutUtilsService.showError("Vui lòng nhập năm chính xác");
			return;
		}

		if (this.nam1 >= this.nam2) {
			this.layoutUtilsService.showError("Năm phía sau không thể nhỏ hơn năm phía trước, vui lòng nhập lại");
			return;
		}

		if (this.mauSoLieuSelected == 0) {
			this.layoutUtilsService.showError("Vui lòng chọn mẫu số liệu");
			return;
		}
		this.loadingSubject.next(true);
		let filter = this.filterConfiguration();
		if (this.IsDefault) {
			this.objectService.MauTheoGiaiDoan(filter).subscribe(res => {
				this.loadingSubject.next(false);
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.listDetail = res.data.SoLieu;
					this.Nams = res.data.Nams;
					this.allowExport = true;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		}
		else {
			this.objectService.theoGiaiDoan(filter).subscribe(res => {
				this.loadingSubject.next(false);
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.listDetail = res.data.SoLieu;
					this.Nams = res.data.Nams;
					this.allowExport = true;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	in() {
		if (this.mauSoLieuSelected == 0) {
			this.layoutUtilsService.showError("Vui lòng chọn mẫu số liệu");
			return;
		}
		if (this.nam1 < 0) {
			this.layoutUtilsService.showError("Vui lòng nhập năm");
			return;
		}
		if (this.nam2 < 0) {
			this.layoutUtilsService.showError("Vui lòng nhập năm");
			return;
		}
		if (this.nam1 >= this.nam2) {
			this.layoutUtilsService.showError("Năm phía sau không thể nhỏ hơn năm phía trước, vui lòng nhập lại");
			return;
		}

		this.loadingSubject.next(true);
		let filter = this.filterConfiguration();
		if (this.IsDefault) {
			this.objectService.xuatMauTheoGiaiDoan(filter).subscribe(res => {
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
		} else {
			this.objectService.xuatTheoGiaiDoan(filter).subscribe(res => {
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
}
