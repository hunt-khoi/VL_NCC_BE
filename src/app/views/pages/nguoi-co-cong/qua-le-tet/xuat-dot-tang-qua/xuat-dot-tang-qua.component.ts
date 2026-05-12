import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import { xuatDotTangQuaService } from './Services/xuat-dot-tang-qua.service';

@Component({
	selector: 'm-xuat-dot-tang-qua',
	templateUrl: './xuat-dot-tang-qua.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class xuatDotTangQuaComponent implements OnInit {
	_name = "";
	itemForm: FormGroup | undefined;
	dataThongKe: any[] = [];
	lstNguon: any[] = [];
	listTinh: any[] = [];
	listXa: any[] = [];
	listXaOpt: any[] = [];
	listXaFiltered: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	FilterCtrlXa: string = '';
	listAp: any[] = [];

	Nam: number = 0;
	thongKe: number = 0;
	listDotQua: any[] = []
	filterprovinces: number = 0;
	display: boolean = false;

	viewLoading: boolean = false;
	queryParams: QueryParamsModel | undefined;
	allowExport = false;
	Capcocau: number = 0;
	filterWard: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public apiService: xuatDotTangQuaService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.xuatds');
	}

	ngOnInit() {
		this.CommonService.liteDotQua(true).subscribe(res => {
			this.listDotQua = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 3) {//xã
				this.thongKe = 2;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
				this.CommonService.GetListKhomApByWard2(this.filterWard).subscribe(res => {
					this.listAp = res.data;
					this.changeDetectorRefs.detectChanges();
				})
			}
			this.createForm();
			this.changeDetectorRefs.detectChanges();
		})
		this.createForm();
		this.loadList();
	}

	createForm() {
		this.itemForm = this.fb.group({
			DotTangQua: [0],
			thongKe: ['' + this.thongKe],
			Tinh: [this.filterprovinces],
			Xa: [this.filterWard],
			Ap: [0],
			LocTrung: [0]
		});
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		if (!this.queryParams) return;
		this.viewLoading = true;
		this.display = false;
		this.loadingSubject.next(true);
		this.apiService.thongKeTheoDotTangQua(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe = res.data.data;
				this.lstNguon = res.data.Nguons;
				this.allowExport = true;
				this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	xuatDanhSach() {
		this.queryParams = this.prepareQuery();
		if (!this.queryParams) return;
		this.loadingSubject.next(true);
		this.apiService.exportDSDotQua(this.queryParams).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất danh sách thất bại");
		});
	}

	changeLoai($event: any) {
		this.thongKe = +$event.value;
		this.dataThongKe = [];
		this.display = false;
		this.changeDetectorRefs.detectChanges();
	}

	prepareQuery(): any {
		let filter = this.filter();
		if (!filter) return null;
		const queryParams = new QueryParamsModel(filter, '', '', 0, 10);
		return queryParams;
	}

	filter(): any {
		if (!this.itemForm) return null;
		if (this.itemForm.controls.DotTangQua.value == 0) {
			this.layoutUtilsService.showError("Hãy chọn đợt tặng quà muốn thống kê");
			return null;
		}
		const filter: any = {};
		filter.Id_Dot = this.itemForm.controls.DotTangQua.value;
		filter.Id_Tinh = this.filterprovinces;
		
		if (this.thongKe != 0 && this.thongKe != 2 && this.thongKe != 3) {
			this.layoutUtilsService.showError("Hãy chọn loại thống kê")
			return null;
		}

		if (this.thongKe == 2) {
			if (this.itemForm.controls.Xa.value != 0)
				filter.Id_Xa = this.itemForm.controls.Xa.value;
			else {
				this.layoutUtilsService.showError("Hãy chọn xã muốn thống kê")
				return null;
			}
		}

		if (this.thongKe == 3) {
			if (this.itemForm.controls.Ap.value != 0) {
				filter.Id_Xa = this.itemForm.controls.Xa.value;
				filter.Id_Ap = this.itemForm.controls.Ap.value;
			}
			else {
				this.layoutUtilsService.showError("Hãy chọn ấp muốn thống kê")
				return null;
			}
		}
		filter.Trung = this.itemForm.controls.LocTrung.value ? "1" : "0" 
		return filter;
	}

	loadList() {
		this.loadXa()
		this.createForm()
	}

	loadXa() {
		if (!this.itemForm) return;
		let id = this.itemForm.controls.Tinh.value
		this.CommonService.GetListWardByProvince(id).subscribe(res => {
			this.listXa = res.data;
			this.listXaOpt = res.data;
			this.listXaFiltered.next(res.data ? res.data.slice() : []);
			this.changeDetectorRefs.detectChanges();
		})
	}

	filterXa() {
		if (!this.listXaOpt) return;
		let search = this.FilterCtrlXa;
		if (!search) {
			this.listXaFiltered.next(this.listXaOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listXaFiltered.next(
			this.listXaOpt.filter(w => w.Ward.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	loadAp() {
		if (!this.itemForm) return;
		let id = this.itemForm.controls.Xa.value;
		this.CommonService.GetListKhomApByWard2(id).subscribe(res => {
			this.listAp = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}
}
