import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { xuatDuToanService } from './Services/xuat-du-toan.service';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../core/auth/_services/token-storage.service';
import * as moment from 'moment';

@Component({
	selector: 'm-xuat-du-toan',
	templateUrl: './xuat-du-toan.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class xuatDuToanComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any[] = [];
	datalength:  any = { data: [] };

	lstHuyen:  any[] = []
	lstSum:  any;
	listNam: any[] = []
	listDC: any[] = []
	id_dc: number = 0;
	DungCu :any ;
	Nam: number;
	DC : number;

	display: boolean = false;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	allowExport = false;
	showSL: boolean = true ;
	showKP: boolean = true ;

	constructor(public xuatDuToanService: xuatDuToanService,
		public CommonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this.Nam = moment().get("year");
		this._name = this.translate.instant("Xuất danh sách dự toán theo năm");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.Nam = moment().get("year");
		this.CommonService.liteDungCuChinhHinh().subscribe(res => {
			if (res && res.status == 1) {
				this.listDC = res.data;
			}
		})
		this.changeDetectorRefs.detectChanges();

	}
	getValue (id, str, item) {
		let find = item.find(x => +x.Id == +id)
		if (find != null) {
			return this.CommonService.f_currency_V2(find[str]);
		}
		return '0';
	}

	loadData() {
		if (this.Nam <= 0) {
			this.layoutUtilsService.showError("Vui lòng nhập năm ");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.allowExport = false;
		this.loadingSubject.next(true);
		this.xuatDuToanService.thongKeTheoNam(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.display = true;
				this.datalength = res.data;
				this.dataThongKe = res.data.data;
				this.allowExport = true;
				this.lstSum = this.datalength.Tongs;
				this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		})
	}
	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.xuatDuToanService.exportDSDuToan(this.queryParams).subscribe(response => {
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
			this.layoutUtilsService.showError("Xuất dự toán thất bại");
		});
	}

	thongKeTheoDC(id_dc: number){
		if(id_dc == 0){
			this.dataThongKe = this.listDC;
		} else{
			let index = this.listDC.findIndex(x => x.Id_DungCu == id_dc);
			let dungCu = this.listDC[index];
			this.dataThongKe = [];
			this.dataThongKe.push(dungCu);
		}
		this.changeDetectorRefs.detectChanges();
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

	filterConfiguration(): any {
		const filter: any = {};
		filter.Nam = this.Nam;
		if (this.id_dc > 0) {
			filter.IdDungCu = this.id_dc;
		}
		return filter;
	}

}