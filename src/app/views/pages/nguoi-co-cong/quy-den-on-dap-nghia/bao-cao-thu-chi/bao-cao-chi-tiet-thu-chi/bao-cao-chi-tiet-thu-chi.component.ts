import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { BaoCaoThuChiService } from '../Services/bao-cao-thu-chi.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
	selector: 'm-bao-cao-chi-tiet-thu-chi',
	templateUrl: './bao-cao-chi-tiet-thu-chi.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class BaoCaoThuChiCTComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";
	dataThongKe: any = { data: [], sum: {} };
	allowExport = false;

	display: boolean = false;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	tsSeparator = "";

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

	now = new Date();
	to: Moment;
	from: Moment;

	constructor(public tracuuHoSoService: BaoCaoThuChiService,
		private commonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this._name = this.translate.instant("Báo cáo chi tiết thu chi");
			this.tsSeparator = commonService.thousandSeparator;
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date(y, 11, 31));
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuuHoSoService.baoCaoQuyThuChiCT(this.queryParams).subscribe(res => {
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

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportBCThuChiCT(this.queryParams).subscribe(res => {
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
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại");
		});
	}

	prepareQuery(): QueryParamsModel {
		let queryParams = new QueryParamsModel({});
		queryParams.filter.TuNgay = this.from.format("DD/MM/YYYY");;
		queryParams.filter.DenNgay = this.to.format("DD/MM/YYYY");;
		return queryParams;
	}

}