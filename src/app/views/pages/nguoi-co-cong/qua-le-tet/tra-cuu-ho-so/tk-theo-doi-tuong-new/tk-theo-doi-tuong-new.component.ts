import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';

@Component({
	selector: 'm-tk-theo-doi-tuong-new',
	templateUrl: './tk-theo-doi-tuong-new.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTheoDoiTuongNewComponent implements OnInit {
	_name = "";
	dataThongKe: any = { DoiTuongs: [], data: [] };
	thongKe: number = 0;
	display: boolean = false;
	hideEmptyRows: boolean = false;

	get dataFiltered(): any[] {
		if (!this.hideEmptyRows) return this.dataThongKe.data;
		return this.dataThongKe.data.filter((item: any) =>
			item.data && item.data.some((x: any) => +x.ThongKe !== 0)
		);
	}
	filterProvince: number = 0;
	filterWard: number = 0;

	viewLoading: boolean = false;
	queryParams: QueryParamsModel = new QueryParamsModel({});
	allowExport = false;
	Capcocau: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	IdDotTangQua: number = 0;
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
	
	constructor(public apiService: tracuuHoSoService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.tkdoituong');
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterProvince = res.IdTinh;
			if (res.Capcocau == 3) { //xã
				this.filterWard = +res.ID_Goc;
			}
		})
		this.CommonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
	}

	loadData() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuu();
	}

	tracuu() {
		this.loadingSubject.next(true);
		this.apiService.thongKeTheoDoiTuongnew(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); 
		})
	}

	onToggleHideEmpty() {
		this.changeDetectorRefs.detectChanges();
	}

	getValue(item: any, id_doituong: number) {
		let find = item.data.find((x: any) => +x.Id_DoiTuongNCC == +id_doituong);
		if (find != null)
			return this.CommonService.f_currency_V2(find.ThongKe);
		return '';
	}

	export() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.loadingSubject.next(true);
		this.apiService.exportTKDoiTuongNew(this.queryParams).subscribe(res => {
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
		const queryParams = new QueryParamsModel(this.filter(), '', '', 0, 10);
		return queryParams;
	}

	filter(): any {
		const filter: any = {};
		filter.IdDot = this.IdDotTangQua;
		filter.isNew = 1;
		return filter;
	}
}