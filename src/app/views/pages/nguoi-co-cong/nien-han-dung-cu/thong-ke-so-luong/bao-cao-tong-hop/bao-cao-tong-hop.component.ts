import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { ThongKeSoLuongService } from '../Services/thong-ke-so-luong.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { bcTongHopModel } from '../Model/de-xuat.model';

@Component({
	selector: 'm-bao-cao-tong-hop',
	templateUrl: './bao-cao-tong-hop.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoTongHopComponent implements OnInit {

	data: bcTongHopModel[] = [];
	TongNguoi: number;
	TongTien: number;
	_name = "";
	allowExport = false;
	display: boolean = false;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	Capcocau: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	IdDot: number = 0;
	lstDot: any[] = [];

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

	constructor(public tracuuHoSoService: ThongKeSoLuongService,
		private CommonService: CommonService,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant("Thống kê số lượng người hưởng theo dụng cụ");
	}

	/** LOAD DATA */
	ngOnInit() {		
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		})

		this.CommonService.liteDotNienHan(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
	}

	changeLoai() {
		this.display = false;
		this.allowExport = false;
		this.changeDetectorRefs.detectChanges();
	}

	loadData() {
		if (this.IdDot <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt nhập niên hạn");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.baoCaoTongHop(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.getData(res.data);
				this.allowExport = true;
				this.display = true;
			}
			else {
				this.allowExport = false;
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	getData(data_res: any){
		this.data = [];
		this.TongNguoi = 0;
		this.TongTien = 0;
		data_res.data.forEach((ele)=> {
			let model : bcTongHopModel = new bcTongHopModel();
			model.clear();
			model.Id = ele.Id;
			model.TenDonVi = ele.TenDonVi;
			if (ele.data.length != 0 ) {
				model.SoNguoi = ele.data[0].SoNguoi;
				model.TongTien = this.CommonService.f_currency_V2(ele.data[0].SoTien.toString());
				this.TongNguoi += ele.data[0].SoNguoi;
				this.TongTien += ele.data[0].SoTien;
			}
			this.data.push(model);
		})
		this.TongTien = this.CommonService.f_currency_V2(this.TongTien.toString());
	}
	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCTongHop(this.prepareQuery()).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại")
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
		filter.IdDot = this.IdDot;
		filter.data = this.data;
		return filter;
	}
}
