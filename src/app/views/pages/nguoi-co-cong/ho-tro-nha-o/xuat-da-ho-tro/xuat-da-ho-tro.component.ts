import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { XuatHoTroNhaService } from './Services/xuat-da-ho-tro.service';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import * as moment from 'moment';
import { TableService } from 'app/views/partials/table/table.service';
import { TableModel } from 'app/views/partials/table';

@Component({
	selector: 'm-xuat-da-ho-tro',
	templateUrl: './xuat-da-ho-tro.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class XuatDaHoTroComponent implements OnInit {

	_name = "";
	dataThongKe: any[] = [];
	Nam: number;
	display: boolean = false;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	allowExport = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public XuatHoTroNhaService: XuatHoTroNhaService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.Nam = moment().get("year");
			this._name = this.translate.instant("Xuất danh sách hỗ trợ nhà ở");
	}

	/** LOAD DATA */
	ngOnInit() {
	}

	loadData() {
		if (this.Nam <= 0) {
			this.layoutUtilsService.showError("Vui lòng nhập năm ");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.loadingSubject.next(true);
		this.XuatHoTroNhaService.getDanhSach(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe =res.data;
				this.allowExport = true;
				this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}
	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.XuatHoTroNhaService.exportDanhSach(this.queryParams).subscribe(response => {
			this.loadingSubject.next(false);
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất thống kê thất bại")
		});
	}

	prepareQuery(): QueryParamsModel {
		let filter = this.filterConfiguration();
		if (filter == null)
			return null;
		const queryParams = new QueryParamsModel(
			filter,
			'', '', 0, 10,
		);

		return queryParams;
	}

	getTien(ncc, loai) { //1: sửa chữa, 2: xây mới
		if (ncc.Id_HinhThuc == +loai) 
			return this.CommonService.f_currency_V2(ncc.ChiPhiYeuCau);
		return ''
	}

	getNamSinh(ncc, loai) { //1: nam, 2: nữ
		if (ncc.GioiTinh == +loai) 
			return ncc.NamSinh;
		return ''
	}

	filterConfiguration(): any {
		const filter: any = {};
		filter.Nam = this.Nam;
		return filter;
	}

}