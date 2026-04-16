import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { NhapBaoHiemService } from './../Services/nhap-bao-hiem.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { DoiTuongBaoHiemModel } from '../../doi-tuong-bao-hiem/Model/doi-tuong-bao-hiem.model';

@Component({
	selector: 'kt-danh-sach-phat',
	templateUrl: './danh-sach-phat.component.html'
})
export class DanhSachPhatComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	_name = "";
	tongSL: any[] = [];
	tongTien: any[] = [];
	ID_nhap = 0;
	DanhSach: any[] = [];

	constructor(
		public danhMucService: CommonService,
		public NhapBaoHiemService: NhapBaoHiemService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private location: Location,
		private translate: TranslateService) {
		this._name = "Danh sách BHYT";
	}


	/** LOAD DATA */
	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params.id) {
				this.ID_nhap = params.id;
			}
		});
		this.LoadData();
	}

	Back() {
		this.location.back();
	}

	LoadData() {
		this.loadingSubject.next(true);
		const query = new QueryParamsModel(this.filterConfiguration());
		this.NhapBaoHiemService.ListCapBHYT(query).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.DanhSach = res.data.Details;
				this.tinhTongMuc();
				this.changeDetectorRefs.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	tinhTongMuc() {
		this.tongTien = [];
		this.tongSL = [];
		for (let i = 0; i < this.DanhSach.length; i++) {
			let doituong = this.DanhSach[i].DoiTuongs;
			let tongTien = [];
			let tongSL = [];
			for (let c1 of doituong) {
				let c = 0;
				let t = 0;
				c1.NCCs.forEach(x => {
					c += 1;
					t += x.SoTien;
				});
				
				tongSL.push(c);
				tongTien.push(t);
			}
			this.tongTien.push(tongTien);
			this.tongSL.push(tongSL);
		}
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.ID_Nhap = this.ID_nhap;
		return filter;
	}

	/** UI */
	getTitle(): string {
		let result = 'Danh sách cấp phát bảo hiểm y tế';
		return result;
	}

	Luu(item: any) {
		const _item = new DoiTuongBaoHiemModel();
		_item.MaTheBHYT = item.MaTheBHYT;
		_item.IsUpdateMa = true;
		_item.Id = item.Id_NCC;

		this.NhapBaoHiemService.UpdateDoiTuongBaoHiem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo("Cập nhật mã BHYT thành công");
				this.LoadData();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	updateMa(item: any, event: any) {
		item.MaTheBHYT = event.target.value;
	}
}
