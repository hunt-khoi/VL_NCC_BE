import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { xuatDotTangQuaService } from '../../xuat-dot-tang-qua/Services/xuat-dot-tang-qua.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

@Component({
	selector: 'm-xuat-dot-tang-qua',
	templateUrl: './xuat-dot-tang-qua.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class xuatDotTangQuaComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	itemForm: FormGroup;

	dataThongKe: any[] = [];
	list10year: any[] = [];

	gridModel: TableModel;
	gridService: TableService;

	listYearChoose: any[] = []

	lstNguon: any[] = []
	listTinh: any[] = []
	listHuyen: any[] = []
	listXa: any[] = []
	listAp: any[] = []

	Nam: number;
	thongKe: number = 0;
	listDotQua: any[] = []

	filterprovinces: number
	display: boolean = false;

	chartOptions = {
		responsive: true,   // THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
		plugins: {
			labels: {
				//render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
				render: function () { return ''; },
			}
		}
	}

	//dữ liệu chart data mẫu  
	labels = ['', '']; //trục x

	// STATIC DATA FOR THE CHART IN JSON FORMAT.
	chartData = [
		{
			label: '',
			data: [0, 0]
		},
		{
			label: '',
			data: [0, 0]
		}
	];

	// CHART COLOR.
	colors = [
		{
			backgroundColor: 'rgba(0,0,0,0)'
		},
		{
			backgroundColor: 'rgba(0,0,0,0)'
		}
	]

	//4 màu cho tối đa 4 nhóm
	bgColor = ['rgba(30,169,224,0.8)', 'rgba(77,83,96,0.2)', 'rgba(255,228,181,0.4)', 'rgba(100,149,237,0.5)']

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;
	allowExport = false;
	Capcocau: number;
	filterdistrict: number = 0;
	filterWard: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public xuatDotTangQuaService: xuatDotTangQuaService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant('QUA_TET.xuatds');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.CommonService.liteDotQua(true).subscribe(res => {
			this.listDotQua = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.Capcocau = res.Capcocau;
			this.loadHuyen();
			if (res.Capcocau == 3) {//xã
				this.thongKe = 2;
				this.filterdistrict = +res.ID_Goc_Cha;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
				this.CommonService.GetListKhomApByWard(this.filterWard).subscribe(res => {
					this.listAp = res.data;
					this.changeDetectorRefs.detectChanges();
				})
			}
			if (res.Capcocau == 2) {
				this.thongKe = 1;
				this.filterdistrict = +res.ID_Goc_Cha;
				this.CommonService.GetListWardByDistrict(this.filterdistrict).subscribe(res => {
					if (res && res.status == 1)
						this.listXa = res.data;
				})
			}
			this.createForm();
			this.changeDetectorRefs.detectChanges();
		})

		this.createForm();
		this.loadList();
	}

	createForm() {
		this.itemForm = this.fb.group({
			DotTangQua: [0],
			thongKe: ['' + this.thongKe],
			Tinh: [this.filterprovinces],
			Huyen: [this.filterdistrict],
			Xa: [this.filterWard],
			Ap: [0],
			LocTrung: [0]
		});
	}

	loadData(loai: boolean = false) {
		this.queryParams = this.prepareQuery();
		if (this.queryParams == null)
			return;
		this.viewLoading = true;
		this.display = false;
		this.loadingSubject.next(true);
		this.xuatDotTangQuaService.thongKeTheoDotTangQua(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe = res.data.data;
				this.lstNguon = res.data.Nguons;
				this.allowExport = true;
				this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	xuatDanhSach() {
		this.queryParams = this.prepareQuery();
		if (this.queryParams == null)
			return;
		this.loadingSubject.next(true);
		this.xuatDotTangQuaService.exportDSDotQua(this.queryParams).subscribe(res => {
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

	changeLoai($event) {
		this.thongKe = +$event.value;
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
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}

		if (this.itemForm.controls.DotTangQua.value == 0) {
			this.layoutUtilsService.showError("Hãy chọn đợt tặng quà muốn thống kê");
			return null;
		}
		else
			filter.Id_Dot = this.itemForm.controls.DotTangQua.value;

		filter.Id_Tinh = this.filterprovinces;
		
		if (this.thongKe != 1 && this.thongKe != 2 && this.thongKe != 0 && this.thongKe != 3) {
			this.layoutUtilsService.showError("Hãy chọn loại thống kê")
			return null;
		}

		if (this.thongKe == 1) {
			if (this.itemForm.controls.Huyen.value != 0)
				filter.Id_Huyen = this.itemForm.controls.Huyen.value;
			else {
				this.layoutUtilsService.showError("Hãy chọn huyện muốn thống kê")
				return null;
			}
		}

		if (this.thongKe == 2) {
			if (this.itemForm.controls.Xa.value != 0) {
				filter.Id_Huyen = this.itemForm.controls.Huyen.value;
				filter.Id_Xa = this.itemForm.controls.Xa.value;
			}
			else {
				this.layoutUtilsService.showError("Hãy chọn xã muốn thống kê")
				return null;
			}
		}
		if (this.thongKe == 3) {
			if (this.itemForm.controls.Ap.value != 0) {
				filter.Id_Huyen = this.itemForm.controls.Huyen.value;
				filter.Id_Xa = this.itemForm.controls.Xa.value;
				filter.Id_Ap = this.itemForm.controls.Ap.value;
			}
			else {
				this.layoutUtilsService.showError("Hãy chọn ấp muốn thống kê")
				return null;
			}
		}

		filter.Trung = this.itemForm.controls.LocTrung.value ? "1" : "0" 

		return filter;
	}

	loadList() {
		this.loadHuyen()
		this.createForm()
	}

	loadHuyen() {
		this.CommonService.GetListDistrictByProvinces(61).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}

	loadXa() {
		let idhuyen = this.itemForm.controls.Huyen.value
		this.CommonService.GetListWardByDistrict(idhuyen).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}
	loadAp() {
		let id = this.itemForm.controls.Xa.value;
		this.CommonService.GetListKhomApByWard(id).subscribe(res => {
			this.listAp = res.data;
			this.changeDetectorRefs.detectChanges();
		})
	}
}
