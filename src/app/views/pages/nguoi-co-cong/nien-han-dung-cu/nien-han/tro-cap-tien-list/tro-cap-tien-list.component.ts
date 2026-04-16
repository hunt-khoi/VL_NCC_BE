import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NienHanService } from './../Services/nien-han.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';

@Component({
	selector: 'kt-tro-cap-tien-list',
	templateUrl: './tro-cap-tien-list.component.html'
})
export class TroCapTienListComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	item: any;
	oldItem: any;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	isZoomSize: boolean = false;
	visibleTangGiam: boolean;
	treeNguoiNhan: any[] = [];
	treeNguoiNhanView: any[] = [];
	_name = "";
	showImport: boolean = false;
	tongSL: any[] = [];
	tienDaPhat: any[] = [];
	ID_Dot = 0;
	DanhSach: any[] = [];
	lstNCC: any[] = [];

	constructor(public danhMucService: CommonService,
		public NienHanService: NienHanService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private location: Location,
		private translate: TranslateService) {
			this._name = "Danh sách cấp tiền trợ cấp dụng cụ";
	}

	/** LOAD DATA */
	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params.id) {
				this.ID_Dot = params.id;
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
		this.NienHanService.ListCapTien(query).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.DanhSach = res.data.Details;
				this.tinhTongMuc();
				this.DanhSach.forEach(x => {
					x.NCCs.forEach(y => {
						if (y.NgayCap ==  null)
							this.lstNCC.push(y.IdDetail);
					});
				})
				this.changeDetectorRefs.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		});
	}

	tinhTongMuc() {
		this.tienDaPhat = [];
		this.tongSL = [];
		for (let i = 0; i < this.DanhSach.length; i++) {
			let nccs = this.DanhSach[i].NCCs;
			let c = 0;
			let t = 0;
			nccs.forEach(x => {
				if (x.NgayCap != null) {
					c += 1;
					t += x.SoTien;
				}
			});
			
			this.tongSL.push(c);
			this.tienDaPhat.push(t);
		}
	}

	capQua(ncc) {
		const _title = this.translate.instant('Xác nhận cấp tiền');
		const _description = this.translate.instant('Bạn có chắc muốn cấp tiền trợ cấp dụng cụ');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý ...');
		const _confirmMessage = this.translate.instant('Cấp tiền trợ cấp thành công');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.NienHanService.capTienDC(ncc.IdDetail).subscribe(res => {
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

	capAll(ncc) {
		const _title = this.translate.instant('Xác nhận cấp tiền');
		const _description = this.translate.instant('Bạn có chắc muốn cấp tiền trợ cấp dụng cụ cho tất cả đối tượng');
		const _waitDesciption = this.translate.instant('Yêu cầu đang được xử lý ...');
		const _confirmMessage = this.translate.instant('Cấp tiền trợ cấp thành công');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.NienHanService.capTienAll(this.lstNCC).subscribe(res => {
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

	filterConfiguration(): any {
		const filter: any = {};
		filter.Id_TroCap = this.ID_Dot;

		return filter; //trả về đúng biến filter
	}
}