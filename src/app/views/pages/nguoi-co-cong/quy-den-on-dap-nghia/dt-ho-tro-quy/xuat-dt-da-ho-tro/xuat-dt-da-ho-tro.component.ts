import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { dtHoTroServices } from '../Services/dt-ho-tro-quy.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import moment from 'moment';

@Component({
	selector: 'kt-xuat-dt-da-ho-tro',
	templateUrl: './xuat-dt-da-ho-tro.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class XuatDTDaHoTroComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any = { Tinhs: [], data: [] };
	allowExport = false;

	listTinh: any[] = []
	listHuyen: any[] = []
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;

	Capcocau: number;
	tsSeparator = "";
	Nam = 0;

	lstCap: any[] = [
		{ Id: '2', Title: '- Cấp huyện'}, 
		{ Id: '3', Title: '- Cấp xã'}, 
	]

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

	constructor(public objectService: dtHoTroServices,
		private commonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.Nam = moment().get("year");
			this._name = this.translate.instant("Danh sách đối tượng đã hỗ trợ");
			this.tsSeparator = commonService.thousandSeparator;
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (this.Capcocau == 2) {
				this.filterDistrict = +res.ID_Goc_Cha;
			}
			if (res.Capcocau == 3) {
				this.filterDistrict = +res.ID_Goc_Cha;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
		})
	}

	loadData() {
		this.viewLoading = true;
		this.display = false;
		this.objectService.getDSDaHoTro(this.Nam).subscribe(res => {
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

	getNS(item, id) { //nam: 1, nữ: 2
		if (item.GioiTinh == id) 
			return item.NamSinh
		return '';
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.objectService.exportDSDaHoTro(this.Nam).subscribe(res => {
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
}