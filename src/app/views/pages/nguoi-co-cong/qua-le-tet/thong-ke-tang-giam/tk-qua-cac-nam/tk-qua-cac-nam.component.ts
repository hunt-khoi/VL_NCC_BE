import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { dottangquaService } from '../../dot-tang-qua/Services/dot-tang-qua.service';
import moment from 'moment';

@Component({
	selector: 'm-tk-qua-cac-nam',
	templateUrl: './tk-qua-cac-nam.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeQuaCacNamComponent implements OnInit {
	filterStatus = '';
	filterCondition = '';
	_name = "";

	itemForm: FormGroup | undefined;
	dataThongKe: any[] = [];
	list10year: any[] = [];
	listYearChoose: any[] = []

	chartOptions = {
		responsive: true,// THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
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
	loadingAfterSubmit: boolean = false;
	queryParams: QueryParamsModel | undefined;
	allowExport = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public apiService: dottangquaService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("Thống kê qua các năm");
	}

	ngOnInit() {
		this.createForm();
		this.loadData();
	}

	loadData() {
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		if (!this.itemForm) return;
		if (this.itemForm.controls.TangGiam.value == "desc")
			this.listGiam();
		else
			this.listTang();
	}

	listGiam() {
		this.loadingSubject.next(true);
		if (!this.queryParams) return;
		this.apiService.thongKeGiam(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.loadChart(); //load biểu đồ
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	listTang() {
		this.loadingSubject.next(true);
		if (!this.queryParams) return;
		this.apiService.thongKeTang(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.loadChart(); //load biểu đồ
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	loadChart() {
		this.chartData = []
		this.colors = []
		for (var i = 0; i < this.dataThongKe.length; i++) {
			var data = []
			for (var val of this.labels) { //danh sách năm cố định đã chọn
				let dem = 0;
				for (var j = 0; j < this.dataThongKe[i].ThongKe.length; j++) {
					if (this.dataThongKe[i].ThongKe[j].Nam == val) {
						data.push(this.dataThongKe[i].ThongKe[j].SL)
					}
					else {
						dem = dem + 1
					}
					if (dem == this.dataThongKe[i].ThongKe.length)
						data.push(0)
				}
			}
			var item = { label: this.dataThongKe[i].NhomLeTet + "(" + this.dataThongKe[i].NguonKinhPhi + ")", data: data }
			var color = { backgroundColor: this.getColor(i) } //mỗi nhóm sẽ có màu khác nhau
			this.colors.push(color)

			this.chartData.push(item);
		}
		this.changeDetectorRefs.detectChanges();
	}

	getColor(index: number): string {
		return this.bgColor[index];
	}

	exportExcel() {
		if (!this.itemForm) return;
		if (this.itemForm.controls.TangGiam.value == "desc")
			this.xuatGiam();
		else
			this.xuatTang();
	}

	xuatGiam() {
		if (!this.queryParams) return;
		this.apiService.exportDSGiam(this.queryParams).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		})
	}

	xuatTang() {
		if (!this.queryParams) return;
		this.apiService.exportDSTang(this.queryParams).subscribe(res => {
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		})
	}

	prepareQuery(): QueryParamsModel {
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			'', '', 0, 10,
			this.filterGroup(this.listYearChoose)
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

	filterConfiguration(): any {
		const filter: any = {};
		if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
			filter.type = +this.filterCondition;
		}
		return filter;
	}

	createForm() {
		var now = moment();
		let y = now.year();
		for (var i: number = 8; i >= -2; i--) {
			let nn = y - i;
			let n: any = { id: nn, title: 'Năm ' + nn };
			this.list10year.push(n);
		}
		this.list10year.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0)); //hiện danh sách checkbox năm tăng dần
		this.itemForm = this.fb.group({
			TangGiam: ['asc'],
		});
	}

	//bắt sự kiện check
	onCheckboxChange(e: any) {
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
		this.dataThongKe = [];
	}
}