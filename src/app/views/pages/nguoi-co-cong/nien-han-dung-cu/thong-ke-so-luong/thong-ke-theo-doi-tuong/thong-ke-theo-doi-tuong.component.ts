import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { ThongKeSoLuongService } from '../../thong-ke-so-luong/Services/thong-ke-so-luong.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'm-thong-ke-theo-doi-tuong',
	templateUrl: './thong-ke-theo-doi-tuong.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ThongKeTheoDoiTuongComponent implements OnInit {

	dataThongKe: any = { DoiTuongs: [], data: [] };
	allowExport = false;

	listTinh: any[] = []
	listHuyen: any[] = []
	thongKe: number = 0; //tk theo huyện
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;

	_name = "";
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
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = this.translate.instant("Thống kê số lượng người hưởng theo đối tượng");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (this.Capcocau == 2) {
				this.thongKe = 1;
				this.filterDistrict = +res.ID_Goc_Cha;
			}
			if (res.Capcocau == 3) {
				this.thongKe = 2;
				this.filterDistrict = +res.ID_Goc_Cha;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
		})
		this.CommonService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data
		})
		this.CommonService.liteDotNienHan(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
		this.loadHuyen();
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
		if (this.thongKe == 1 && this.filterDistrict == 0) {
			this.layoutUtilsService.showError("Vui lòng chọn huyện thống kê");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.thongKeTheoDoiTuong(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.display = true;
			}
			else {
				this.dataThongKe = []
				this.allowExport = false;
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	loadHuyen() {
		this.display = false
		this.CommonService.GetListDistrictByProvinces(this.filterprovinces).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}
	filterHuyen(): any {
		const filter: any = {};
		filter.ProvinceID = this.filterprovinces;
		return filter
	}

	getValue(item: any, id_doituong: any) {
		let find = item.data.find(x => +x.Id_DoiTuong == +id_doituong);
		if (find != null)
			return this.CommonService.f_currency_V2(find.SoLuong);
		return '_';
	}
	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportTKDoiTuong(this.queryParams).subscribe(res => {
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

	filterGroup(values: any[]): any {
		let filterGroup: any = [];
		let val = []
		for (let item of values) {
			val.push(item)
		}
		filterGroup.Nam = val
		return filterGroup;
	}

	filterConfiguration(): any {
		const filter: any = {};
		if (this.thongKe == 0) //tra cứu theo huyện
			filter.Id_Tinh = this.filterprovinces
		else { //tra cứu theo xã
			filter.Id_Huyen = this.filterDistrict 
			filter.Id_Xa = this.filterWard
		}

		filter.IdDot = this.IdDot;
		return filter;
	}
}
