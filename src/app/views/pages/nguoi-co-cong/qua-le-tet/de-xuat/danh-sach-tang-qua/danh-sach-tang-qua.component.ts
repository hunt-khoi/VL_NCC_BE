import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { DeXuatService } from './../Services/de-xuat.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { TangQuaDialogComponent } from './../tang-qua-dialog/tang-qua-dialog.component';
import { PhatQuaService } from './../Services/phat-qua.service';

@Component({
	selector: 'kt-danh-sach-tang-qua',
	templateUrl: './danh-sach-tang-qua.component.html'
})

export class DanhSachTangQuaComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	item: any;
	oldItem: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	filterDonVi: string = '';
	listDotTangQua: any[] = [];
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	allowImport: boolean;
	visibleTangGiam: boolean;
	treeNguoiNhan: any[] = [];
	treeNguoiNhanView: any[] = [];
	_name = "";
	showImport: boolean = false;
	tongMuc: any[] = [];
	tienDaPhat: any[] = [];
	ID_qua_tang = 0;
	DanhSach: any[] = [];
	TongSo: number = 0;
	TongTien: number = 0;

	constructor(
		private fb: FormBuilder,
		public danhMucService: CommonService,
		public DeXuatService: DeXuatService,
		public PhatQuaService: PhatQuaService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private location: Location,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.dot');
	}


	/** LOAD DATA */
	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params.id) {
				this.ID_qua_tang = params.id;
			}
		});
		this.LoadData();

	}

	Back() {
		// window.history.back();
		this.location.back();
	}

	LoadData() {
		this.loadingSubject.next(true);
		const query = new QueryParamsModel(this.filterConfiguration());
		this.PhatQuaService.ListNhanQua(this.ID_qua_tang, query).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.DanhSach = res.data;
				this.tinhTongMuc();
				this.changeDetectorRefs.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}
	TongPhat = 0;
	tinhTongMuc() {
		this.tongMuc = [];
		this.TongSo = 0;
		this.TongTien = 0;
		this.TongPhat = 0;
		this.tienDaPhat = [];
		for (let i = 0; i < this.DanhSach.length; i++) {
			let DanhSach = this.DanhSach[i].data;
			let tongMuc = [];
			let tienDaPhat = [];
			for (let c1 of DanhSach) {
				let s = 0;
				let c = 0;
				let tienphat = 0;
				for (let c2 of c1.DoiTuongs) {
					s += c2.NCCs.map(el => this.danhMucService.stringToInt(el.SoTien)).reduce((a, b) => a + b);
					c += c2.NCCs.length;
					tienphat += c2.NCCs.map(el => {
						if (el.Received) {
							return this.danhMucService.stringToInt(el.SoTien);
						}
						return 0;
					}).reduce((a, b) => a + b);
				}
				tongMuc.push(this.danhMucService.f_currency_V2('' + s));
				tienDaPhat.push(this.danhMucService.f_currency_V2('' + tienphat));
				this.TongSo += c;
				this.TongTien += s;
				this.TongPhat += tienphat;
			}
			this.tongMuc.push(tongMuc);
			this.tienDaPhat.push(tienDaPhat);
		}
	}

	tinhTienDaphat() {

	}
	Nhanqua(ncc) {
		const dialogRef = this.dialog.open(TangQuaDialogComponent, { data: { ncc, Id_DeXuat: this.ID_qua_tang } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				// this.loadDataList();
			}
			else {
				this.LoadData();
				// this.layoutUtilsService.showInfo(_saveMessage);
				// this.loadDataList();
			}

		});
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.ID_dexuat_Detail = this.ID_qua_tang;

		return filter; //trả về đúng biến filter
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('DE_XUAT.danhsachqua');
		return result;
	}

}
