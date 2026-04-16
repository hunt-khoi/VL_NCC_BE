import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'm-tk-theo-doi-tuong-new',
	templateUrl: './tk-theo-doi-tuong-new.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTheoDoiTuongNewComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	itemForm: FormGroup;

	dataThongKe1: any = { DoiTuongs: [], data: [] };
	dataThongKe2: any = { DoiTuongs: [], data: [] };

	gridModel: TableModel;
	gridService: TableService;

	listTinh: any[] = []
	listHuyen: any[] = []

	thongKe: number = 0;//tk theo huyện
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;

	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	allowExport1 = false;
	allowExport2 = false;
	Capcocau: number;
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
	
	constructor(public tracuuHoSoService: tracuuHoSoService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.tkdoituong');
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
			if (res.Capcocau == 3) {//xã
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
		this.CommonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
		this.createForm()
		this.loadHuyen();
	}
	changeLoai($event) {
		this.thongKe = +$event.value;
		this.display = false;
		this.changeDetectorRefs.detectChanges();
	}
	loadData(loai: boolean = false) {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng qua");
			return;
		}
		this.queryParams = this.prepareQuery(loai);
		this.viewLoading = true;
		this.display = false;
		if (loai)
			this.tracuuTheoHuyen()
		else
			this.tracuuTheoXa()
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
		filter.ProvinceID = this.filterprovinces
		return filter
	}

	tracuuTheoHuyen() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.thongKeTheoDoiTuongnew(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe1 = res.data
				this.allowExport1 = true;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	tracuuTheoXa() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.thongKeTheoDoiTuongnew(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe2 = res.data
				this.allowExport2 = true;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}
	getValue(item, id_doituong) {
		let find = item.data.find(x => +x.Id_DoiTuongNCC == +id_doituong);
		if (find != null)
			return this.CommonService.f_currency_V2(find.ThongKe);
		return '';
	}
	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportTKDoiTuongNew(this.queryParams).subscribe(res => {
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

	prepareQuery(loai: boolean): QueryParamsModel {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(loai),
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

	filterConfiguration(loai: boolean): any {
		const filter: any = {};
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (loai)
			filter.Id_Tinh = this.itemForm.controls.Tinh.value //tra cứu theo huyện
		else {
			filter.Id_Huyen = this.itemForm.controls.Huyen.value //tra cứu theo xa
			filter.Id_Xa = this.itemForm.controls.Xa.value //tra cứu theo xa
		}

		filter.IdDot = this.IdDotTangQua;
		filter.isNew = 1;
		return filter;
	}

	createForm() {
		// this.list10year = data.Nam;
		// this.list10year.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)); //hiện danh sách checkbox năm tăng dần
		let now = moment();
		this.itemForm = this.fb.group({
			//Nam: [now.get('year')],
			thongKe: ['' + this.thongKe],
			Tinh: [this.filterprovinces],
			Huyen: [this.filterDistrict],
			Xa: [this.filterWard],
		});
	}
}
