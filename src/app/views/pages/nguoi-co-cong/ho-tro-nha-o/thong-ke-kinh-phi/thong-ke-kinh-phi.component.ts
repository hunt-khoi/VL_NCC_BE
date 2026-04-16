import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
// Services
import { ThongKeKinhPhiService } from '../thong-ke-kinh-phi/Services/thong-ke-kinh-phi.service';
import { CommonService } from '../../services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { TableService } from 'app/views/partials/table/table.service';
import { TableModel } from 'app/views/partials/table';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import * as moment from 'moment';
import { ThongKeKinhPhiDialogComponent } from './thong-ke-kinh-phi-dialog/thong-ke-kinh-phi-dialog.component';

@Component({
	selector: 'm-thong-ke-kinh-phi',
	templateUrl: './thong-ke-kinh-phi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThongKeKinhPhiComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	Nam: number
	dataThongKe: any = { data: [] };

	gridModel: TableModel;
	gridService: TableService;

	listTinh: any[] = [];
	listHuyen: any[] = [];
	listXa: any[] = [];

	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	Capcocau: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	lstNguon: any[] = [];
	lstHT: any[] = [];
	lstCap: any[] = [];
	dataCap: any = { data: [] };
	dataTong: any = {};

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

	constructor(public ThongKeKinhPhiService: ThongKeKinhPhiService,
		public CommonService: CommonService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.Nam = moment().get("year");
			this._name = this.translate.instant("Thống kê kinh phí hỗ trợ");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
		})
		this.CommonService.GetListOrganizationalChartStructure().subscribe(res => {
			if (res && res.status == 1)
				this.lstCap = res.data;
		})
		this.CommonService.getNguonHTNO().subscribe(res => {
			if (res && res.status == 1)
				this.lstNguon = res.data;
		})
		this.CommonService.getHinhThucHTNO().subscribe(res => {
			if (res && res.status == 1)
				this.lstHT = res.data;
		})
	}
	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.loadingSubject.next(true);
		this.ThongKeKinhPhiService.thongKeKinhPhi(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe = res.data;
				this.dataCap = this.dataThongKe.cap;
				this.dataTong = this.dataThongKe.tong;
			}
			else {
				this.dataThongKe = [];
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges();
		})
	}

	//row tổng cộng =================================================
	getTongTien(id, item) {
		let idx = item.TongTien.findIndex(x => x.IdNguon == id);
		let sum = 0;
		if (idx > -1) 
			sum = item.TongTien[idx].TienNguon;
		return this.CommonService.f_currency_V2(sum.toString());
	}

	getTongHT(id, str, item) {
		let idx = item.HinhThucs.findIndex(x => x.IdHinhThuc == id);
		let sum = 0;
		if (idx > -1) 
			sum = item.HinhThucs[idx][str];
		return this.CommonService.f_currency_V2(sum.toString());
	}

	sumNguon(id, idht, item) {
		let dtHinhThuc = item.HinhThucs;
		var sum = 0;
		let idx = dtHinhThuc.findIndex(x => x.IdHinhThuc == idht);
		if (idx > -1) {
			let idxx = dtHinhThuc[idx].Nguons.findIndex(x => x.IdNguon == id);
			if (idxx > -1)
				sum = dtHinhThuc[idx].Nguons[idxx].TienNguon;
		}
		return this.CommonService.f_currency_V2(sum.toString());
	}
	//========================================================

	sumTien(id, item) {
		var sum = 0;
		for(let i = 0; i < item.length; i++) {
			var tien = +this.getTongCap(id, item[i], false)
			sum += tien
		}
		return this.CommonService.f_currency_V2(sum.toString());
	}

	getValueHT(id, str, item, isCurrency = true) {
		let find = item.Caps.find(x => +x.IdHinhThuc == +id)
		if (find != null) {
			if(isCurrency)
				return this.CommonService.f_currency_V2(find[str]);
			return find[str];
		}
		return '0';
	}

	getNguon(id, idht, item, isCurrency = true) {
		var ht = item.Caps.find(x => +x.IdHinhThuc == +idht)
		if(ht != null) {
			let find = ht.Nguons.find(x => +x.IdNguon == +id)
			if (find != null) {
				if(isCurrency)
					return this.CommonService.f_currency_V2(find.TienNguon);
				return find.TienNguon;
			}
			return '0';
		}
		return '0';
	}

	getTongCap(id, item, isCurrency = true) {
		let find = item.TongTien.find(x => +x.IdNguon == +id)
		if (find != null) {
			if(isCurrency)
				return this.CommonService.f_currency_V2(find.TienNguon);
			return find.TienNguon;
		}
		return '0';
	}

	xuatDanhSach() {
		this.queryParams = this.prepareQuery();
		this.loadingSubject.next(true);
		this.ThongKeKinhPhiService.exportTKKinhPhi(this.queryParams).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất thống kê thất bại")
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

		filter.Nam = this.Nam;
		return filter;
	}

	xem (cap = 0, hinhthuc = 0, huyen = 0) {
		let query = new QueryParamsModel({});
		query.filter.Nam = this.Nam;
		if (huyen > 0)
			query.filter.IdHuyen = huyen; //0: tỉnh
		if (cap > 0)
			query.filter.IdCap = cap; //0: lấy tổng
		if (hinhthuc > 0)
			query.filter.IdHinhThuc = hinhthuc; //0: lấy tổng ko theo hình thức
		const dialogRef = this.dialog.open(ThongKeKinhPhiDialogComponent, { 
			data: { 'queryParams': query } 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
		});
	}
}
