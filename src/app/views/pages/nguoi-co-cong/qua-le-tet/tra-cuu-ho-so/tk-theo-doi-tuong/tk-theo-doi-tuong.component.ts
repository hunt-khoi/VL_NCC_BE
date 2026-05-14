import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';

@Component({
	selector: 'm-tk-theo-doi-tuong',
	templateUrl: './tk-theo-doi-tuong.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTheoDoiTuongComponent implements OnInit {
	_name = "";
	itemForm: FormGroup | undefined;

	dataThongKe1: any[] = [];
	listTinh: any[] = []
	listHuyen: any[] = []

	thongKe: number = 0;
	display: boolean = false;
	filterprovinces: number = 0;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel = new QueryParamsModel({});
	allowExport1 = false;
	Capcocau: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public apiService: tracuuHoSoService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant("Thống kê chi trả theo xã/huyện từng đối tượng");
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			this.createForm();
			if (res.Capcocau != 3) {
				this.loadHuyen();
			}
		})
		this.CommonService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data
		})
	}

	loadData(loai: boolean = false) {
		this.queryParams = this.prepareQuery(loai);
		this.viewLoading = true;
		this.display = false;
		this.tracuu();
	}

	loadHuyen() {
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

	tracuu() {
		this.loadingSubject.next(true);
		this.apiService.thongKeTheoDoiTuong(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.viewLoading = false;
			this.display = true;
			if (res && res.status == 1) {
				this.dataThongKe1 = res.data
				this.allowExport1 = true;
			}
			else
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges();
		})
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.apiService.exportTKDoiTuong(this.queryParams).subscribe(res => {
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

	filterConfiguration(loai: boolean): any {
		if (!this.itemForm) return;
		const filter: any = {};
		if (loai)
			filter.Id_Tinh = this.itemForm.controls.Tinh.value;
		else
			filter.Id_Huyen = this.itemForm.controls.Huyen.value;
		filter.Nam = this.itemForm.controls.Nam.value;
		return filter;
	}

	createForm() {
		this.thongKe = 0;
		this.itemForm = this.fb.group({
			Tinh: ['' + this.filterprovinces],
		});
	}
}