import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';

export const data: any = {
	Nam: [
		{
			id: 2020,
			title: 'Năm 2020',
		}, {
			id: 2019,
			title: 'Năm 2019',
		}, {
			id: 2018,
			title: 'Năm 2018',
		},
		{
			id: 2017,
			title: 'Năm 2017'
		}, {
			id: 2016,
			title: 'Năm 2016',
		}, {
			id: 2015,
			title: 'Năm 2015',
		}, {
			id: 2014,
			title: 'Năm 2014',
		}, {
			id: 2013,
			title: 'Năm 2013',
		}, {
			id: 2012,
			title: 'Năm 2012',
		}, {
			id: 2011,
			title: 'Năm 2011',
		}
	]
};

@Component({
	selector: 'm-tk-theo-doi-tuong',
	templateUrl: './tk-theo-doi-tuong.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTheoDoiTuongComponent implements OnInit {
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	//@ViewChild('searchInput') searchInput: ElementRef;

	filterStatus = '';
	filterCondition = '';
	_name = "";

	itemForm: FormGroup;

	dataThongKe1: any[] = [];
	dataThongKe2: any[] = [];
	list10year: any[] = [];

	gridModel: TableModel;
	gridService: TableService;

	listYearChoose: any[] = []

	listTinh: any[] = []
	listHuyen: any[] = []

	thongKe: number = 0;//tk theo huyện
	display: boolean = false;
	filterprovinces: number;
	filterDistrict: number;

	chartOptions = {
        responsive: true ,   // THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
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
	allowExport1 = false;
	allowExport2 = false;
	Capcocau: number;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
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
		this._name = this.translate.instant("Thống kê chi trả theo xã/huyện từng đối tượng");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			if (this.Capcocau == 2)
				this.filterDistrict = +res.ID_Goc_Cha
		})
		this.CommonService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data
		})
		this.createForm()
		this.loadHuyen();
	}
	changeLoai($event) {
		this.thongKe = +$event.value;
		this.changeDetectorRefs.detectChanges();
	}
	loadData(loai: boolean = false) {
		this.queryParams = this.prepareQuery(loai);
		this.viewLoading = true;
		this.display = false;
		if (loai == true) {
			this.tracuuTheoHuyen()
		}
		else
			this.tracuuTheoXa()
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

	tracuuTheoHuyen() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.thongKeTheoDoiTuong(this.queryParams).subscribe(res => {
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
		this.tracuuHoSoService.thongKeTheoDoiTuong(this.queryParams).subscribe(res => {
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

		this.labels = val; //label cho trục x (Năm)
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

		if (loai == true)
			filter.Id_Tinh = this.itemForm.controls.Tinh.value //tra cứu theo huyện
		else
			filter.Id_Huyen = this.itemForm.controls.Huyen.value //tra cứu theo xa

		filter.Nam = this.itemForm.controls.Nam.value

		return filter;
	}

	createForm() {
		// this.list10year = data.Nam;
		// this.list10year.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)); //hiện danh sách checkbox năm tăng dần
		this.thongKe = 0;
		if (this.Capcocau == 2) {
			this.thongKe = 1;
		}

		let now = moment();
		this.itemForm = this.fb.group({
			Nam: [now.get('year')],
			thongKe: ['' + this.thongKe],
			Tinh: [61],
			Huyen: [this.filterDistrict],
		});
	}

	//bắt sự kiện check
	onCheckboxChange(e) {
		if (e.checked) {
			this.listYearChoose.push(e.source.value);
		}
		else {
			let index = this.listYearChoose.indexOf(e.source.value, 0);
			if (index > -1) {
				this.listYearChoose.splice(index, 1);
			}
		}
		this.listYearChoose.sort();
	}

	get10YearLast() {
		var n: number = 10;
		let now = new Date();
		var year = now.getFullYear();
		while (n > 0) {
			this.list10year.push(year);
			year = year - 1;
			n = n - 1;
		}
	}
}
