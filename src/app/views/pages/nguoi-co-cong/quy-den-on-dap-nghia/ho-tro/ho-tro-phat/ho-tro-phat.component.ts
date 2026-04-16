import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { HoTroService } from './../Services/ho-tro.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { dtHoTroServices } from '../../dt-ho-tro-quy/Services/dt-ho-tro-quy.service';
import { HoTro_DTModel } from '../../dt-ho-tro-quy/Model/dt-ho-tro-quy.model';
import { HoTroPhatEditDialogComponent } from '../ho-tro-phat-edit/ho-tro-phat-edit.dialog.component';

@Component({
	selector: 'kt-ho-tro-phat',
	templateUrl: './ho-tro-phat.component.html'
})
export class HoTroPhatComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	item: any;
	oldItem: any;
	hasFormErrors: boolean = false;
	loadingAfterSubmit: boolean = false;
	viewLoading: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	treeNguoiNhan: any[] = [];
	_name = "";
	tongSL: any[] = [];
	tienDaPhat: any[] = [];
	tongTien: any[] = [];
	ID_DanhSach = 0;
	tsSeparator = '';

	constructor(public danhMucService: CommonService,
		public HoTroService: HoTroService,
		public dtHoTroService: dtHoTroServices,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private location: Location,
		private translate: TranslateService) {
			this.tsSeparator = danhMucService.thousandSeparator
			this._name = "Danh sách cấp tiền hỗ trợ cho đối tượng";
	}

	/** LOAD DATA */
	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params.id) {
				this.ID_DanhSach = params.id;
			}
		});
		this.LoadData();

	}

	Back() {
		this.location.back();
	}

	LoadData() {
		this.loadingSubject.next(true);
		this.HoTroService.getItem(this.ID_DanhSach).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.item = res.data;
				this.treeNguoiNhan = this.item.DoiTuongs;
				this.tinhTongMuc();
				this.changeDetectorRefs.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	tongTienHT: number = 0
	tinhTongMuc() {
		this.tienDaPhat = [];
		this.tongSL = [];
		this.tongTien = [];
		for (let i = 0; i < this.treeNguoiNhan.length; i++) {
			let nccs = this.treeNguoiNhan[i].NCCs;
			let c = 0;
			let t = 0;
			let t2 = 0;
			nccs.forEach(x => {
				if (x.IsHoTro) {
					t2 += x.SoTienHT;
					this.tongTienHT += x.SoTienHT;
				}
				c += 1;
				t += x.SoTien;
			});
			
			this.tongSL.push(c);
			this.tienDaPhat.push(t2);
			this.tongTien.push(t);
		}
	}

	capQua2(ncc) { //hỗ trợ tất cả
		const _title = this.translate.instant('Xác nhận hỗ trợ');
		const _description = this.translate.instant('Bạn có chắc muốn hỗ trợ đối tượng');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý ...');
		const _confirmMessage = this.translate.instant('Hỗ trợ đối tượng thành công');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			var ht = new HoTro_DTModel();
			ht.Id_NoiDung = 0; //id nội dung chung
			ht.NoiDungHoTro = ""; //nhập nội dung
			ht.SoTien = 0;

			this.dtHoTroService.hoTroDT(ncc.Id, ht).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_confirmMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.LoadData();
			});
		});
	}

	capQua(ncc) {
		ncc.Id_Chi = this.item.Id_Chi
		ncc.Id_NoiDung = this.item.Id_NoiDung
		const dialogRef = this.dialog.open(HoTroPhatEditDialogComponent, { data: { _item: ncc } });
		dialogRef.afterClosed().subscribe(res => {
			if (res) {
				this.layoutUtilsService.showInfo("Hỗ trợ đối tượng thành công");
				this.LoadData();
			}

		});
	}

}