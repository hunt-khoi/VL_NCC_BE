import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services

import { dottangquaService } from '../../dot-tang-qua/Services/dot-tang-qua.service';

import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel } from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'

@Component({
	selector: 'm-tk-slnhan-qua-cac-nam-theo-nhom',
	templateUrl: './tk-slnhan-qua-cac-nam-theo-nhom.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeSLNhanQuaNamTheoNhomComponent implements OnInit {
	// Table fields
	displayedColumns = ['STT', 'HoTen', 'SoHoSo'];
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
	//@ViewChild('searchInput') searchInput: ElementRef;

	filterStatus = '';
	filterCondition = '';
	// filter: any = {};
	_name = "";

	itemForm: FormGroup;

	dataThongKe: any[] = [];

	list10year: any[] = [];

	listNhomLeTet: any[] = [];
	listYearChoose: any[] = []

	gridModel: TableModel;
	gridService: TableService;

	chartOptions = {
		responsive: true,   // THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
		plugins: {
			labels: {
				//render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
				render: function () { return ''; },
			}
		}
	}

	labels = ['', '']; //trục x

	// STATIC DATA FOR THE CHART IN JSON FORMAT.
	chartData = [
		{
			label: '',
			data: [0, 0, 0]
		}
	];

	// CHART COLOR.
	colors = [
		{
			backgroundColor: 'rgba(0,0,0,0)'
		},
	]
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	queryParams: QueryParamsModel;
	allowExport = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	constructor(public dottangquaService1: dottangquaService,
		private CommonService: CommonService,
		public dialog: MatDialog,
		private fb: FormBuilder,
		private route: ActivatedRoute,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("Thống kê số lượng người nhận qua các năm theo nhóm lễ tết");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.createForm()
		this.loadNhom();
	}

	loadNhom() {
		this.CommonService.liteNhomLeTet().subscribe(res => {
			this.listNhomLeTet = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadData() {
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		this.queryParams = this.prepareQuery();
		this.viewLoading = true;
		this.loadingSubject.next(true);
		this.dottangquaService1.thongKeSL(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
			this.viewLoading = false;
			if (res && res.status == 1) {
				this.dataThongKe = res.data
				this.allowExport = true;
				this.loadChart();
			}
			else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	loadChart() {
		this.chartData = []
		this.colors = []
		var data = []
		for (var val of this.labels) { //danh sách năm cố định đã chọn
			let dem = 0;
			for (var i = 0; i < this.dataThongKe.length; i++) {
				if (this.dataThongKe[i].Nam == val) {
					data.push(this.dataThongKe[i].SL)
				}
				else
					dem = dem + 1
				if (dem == this.dataThongKe.length)
					data.push(0)
			}
		}
		var tennhom = this.changeIdNhomLeTet(this.itemForm.controls.NhomLeTet.value)
		var item = { label: tennhom, data: data }
		var color = { backgroundColor: 'rgba(255,228,181,0.7)' }
		this.colors.push(color)

		this.chartData.push(item);
		this.changeDetectorRefs.detectChanges();
	}

	changeIdNhomLeTet(id: number): string {
		let input = ""
		this.listNhomLeTet.forEach(i => {
			if (i.id == id)
				input = i.title
		});
		return input;
	}

	exportExcel() {
		this.dottangquaService1.exportThongKeSL(this.queryParams).subscribe(res => {
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

		filter.Id_NhomLeTet = this.itemForm.controls.NhomLeTet.value;
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
			Nam: [Validators.required],
			NhomLeTet: [null, Validators.required],
			TangGiam: ['asc'],
		});
		this.itemForm.controls["NhomLeTet"].markAsTouched();
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

}
