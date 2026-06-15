import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

export class thongKeTheoDoiTuongComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	_name: string = "";
	itemForm: FormGroup = new FormGroup({});

	dataThongKe: any[] = [];
	listTinh: any[] = [];
	listHuyen: any[] = [];

	thongKe: number = 0;
	display: boolean = false;
	filterprovinces: number = 0;
	viewLoading: boolean = false;
	queryParams: QueryParamsModel = new QueryParamsModel({});
	allowExport = false;
	Capcocau: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

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
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._name = this.translate.instant("Thống kê chi trả theo xã/huyện từng đối tượng");
	}

	ngOnInit() {
		this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			this.createForm();
			if (res.Capcocau != 3) {
				this.loadHuyen();
			}
		})
		this.CommonService.GetAllProvinces().pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.listTinh = res.data
		})
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.display = false;
		this.tracuu();
	}

	loadHuyen() {
		this.CommonService.GetListDistrictByProvinces(this.filterprovinces).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		this.apiService.thongKeTheoDoiTuong(this.queryParams).pipe(takeUntil(this.destroy$)).subscribe(res => {
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

	export() {
		this.loadingSubject.next(true);
		this.apiService.exportTKDoiTuong(this.queryParams).pipe(takeUntil(this.destroy$)).subscribe(res => {
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
		const queryParams = new QueryParamsModel(this.filter(),'', '', 0, 10);
		return queryParams;
	}

	filter(): any {
		const filter: any = {};
		filter.Id_Tinh = this.itemForm.controls.Tinh.value;
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