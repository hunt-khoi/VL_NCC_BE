import { Component, OnInit, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CommonService } from '../../../services/common.service';
import { dvDongGopServices } from '../Services/dv-dong-gop.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import moment from 'moment';

@Component({
	selector: 'kt-dv-dong-gop-bc',
	templateUrl: './dv-dong-gop-bc.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DVDongGopBaoCaoComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	_name = "";

	dataThongKe: any = { Tinhs: [], data: [] };
	allowExport = false;
	listTinh: any[] = []
	listHuyen: any[] = []
	display: boolean = false;
	filterprovinces: number = 0;
	filterDistrict: number = 0;
	filterWard: number;
	listXa: any[] = [];

	viewLoading: boolean = false;
	queryParams: QueryParamsModel;

	Capcocau: number;
	tsSeparator = "";
	lstThang = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; 
	Nam = 0
	lstCap: any[] = [
		{ Id: '2', Title: '- Cấp huyện'}, 
		{ Id: '3', Title: '- Cấp xã'}, 
	]
	isASC: boolean = false;
	typeSort: number = 2;
	showBD: boolean = false;

	style_print: any = {
		// @media print{@page {size: landscape}},
		td: {
			'border-right': '1px solid #dee2e6',
			'border-bottom': '1px solid #dee2e6',
		},
		th: {
			'border-right': '1px solid #dee2e6',
			'border-bottom': '1px solid #dee2e6',
		},
		table: { 'border': '1px solid #dee2e6' },
	};

	chartOptions = {
        responsive: true,  
        plugins: {
            labels: {
                render: function () { return ''; },
            }
        },
		elements: {
			line: {
				fill: false
			}
		},
		scales: {
			yAxes: [{
				scaleLabel: {
					display: true,
					labelString: "VND",
				},
				position: "left",
				id: "y-axis-0",
				ticks: {
					beginAtZero: true,
				}
			}, {
				scaleLabel: {
					display: true,
					labelString: "%",
				},
				position: "right",
				id: "y-axis-1",
				ticks: {
					beginAtZero: true,
				}
			}],
		}
    }

    //Trục x
    labels =  [];
    chartData = [];
    
    // CHART COLOR.
    colors = [ { 
			backgroundColor: 'rgb(247, 142, 142)'
  		},{ 
          	backgroundColor: 'rgba(98, 207, 250, 0.8)'
        }, { 
          	backgroundColor: 'rgba(250, 192, 99, 0.912)'
        },{ 
			backgroundColor: 'rgba(123, 246, 105, 0.907)'
		}
    ]

	constructor(public objectService: dvDongGopServices,
		private commonService: CommonService,
		private ref: ApplicationRef,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.Nam = moment().get("year");
			this._name = this.translate.instant("Báo cáo đơn vị đóng góp");
			this.tsSeparator = commonService.thousandSeparator;
	}

	/** LOAD DATA */
	ngOnInit() {
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
			this.filterprovinces = res.IdTinh;
			if (this.Capcocau == 2) {
				this.filterDistrict = +res.ID_Goc_Cha;
			}
			if (res.Capcocau == 3) {
				this.filterDistrict = +res.ID_Goc_Cha;
				this.filterWard = +res.ID_Goc;
				this.listXa = [{
					Ward: res.DonVi,
					ID_Row: res.ID_Goc
				}];
			}
		})
	}

	getQueryParams() {
		let sortField: string;
		if (this.typeSort == 1)
			sortField = 'DonVi';
		if (this.typeSort == 2)
			sortField = 'TienChiTieu';
		if (this.typeSort == 3)
			sortField = 'Tong';
		if (this.typeSort == 4)
			sortField = 'ChenhLech';
		if (this.typeSort == 5)
			sortField = 'PTChenhLech';
		var queryParams = new QueryParamsModel({});
		queryParams.filter.Nam = this.Nam;
		queryParams.sortField = sortField;
		queryParams.sortOrder = this.isASC ? 'asc' : 'desc';
		return queryParams;
	}

	loadData() {
		this.viewLoading = true;
		this.display = false;
		this.showBD = false;
		var queryParams = this.getQueryParams();
		this.objectService.getBCDongGop(queryParams).subscribe(res => {
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

	getBieuDo() {
		this.showBD = false;
		this.display = false;
		var queryParams = this.getQueryParams();
		this.objectService.getBieuDoDongGop(queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.labels = res.data.labels;
				this.chartData = res.data.data;
				this.showBD = true;
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
		})
	}

	getValue(item, t) {
		var find = item.Thangs.find(x => x.Thang == t)
		if (find != null)
			return this.commonService.f_currency_V2(find['SoTien'].toString())
		return '0'
	}

	sumThang(item, t, isCurrency = true) {
		var sum = 0;
		item.forEach(x => {
			x.Thangs.forEach(y => {
				if (y.Thang == t)
					sum += y.SoTien
			});
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTong(item, str, isCurrency = true) {
		var sum = 0;
		item.forEach(x => {
			sum += x[str]
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	replace(result) {
		return result.toString().replace('.', ',')
	}

	tinhPT(item) {
		var sumT = this.sumTong(item, 'Tong', false)
		var sumCT = this.sumTong(item, 'TienChiTieu', false)
		if (sumCT == 0) return 0;
		let value = sumT / sumCT * 100;
		return this.replace(Math.round(value * 1000) / 1000);
	}

	sumThangHuyen(item, t, isCurrency = true) {
		var sum = 0;
		item.forEach(x => {
			sum += this.sumThang(x.ThongKes, t, false)
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	sumTongHuyen(item, str, isCurrency = true) {
		var sum = 0;
		item.forEach(x => {
			sum += this.sumTong(x.ThongKes, str, false)
		});
		return isCurrency ? this.commonService.f_currency_V2(sum.toString()) : sum;
	}

	tinhPTHuyen(item) {
		var sumT = this.sumTongHuyen(item, 'Tong', false)
		var sumCT = this.sumTongHuyen(item, 'TienChiTieu', false)
		if (sumCT == 0) return 0;
		let value = sumT / sumCT * 100;
		return this.replace(Math.round(value * 1000) / 1000);
	}

	xuatDanhSach() {
		this.loadingSubject.next(true);
		var queryParams = this.getQueryParams();
		this.objectService.exportBCDongGop(queryParams).subscribe(res => {
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

	printTicket(print_template) {
		let innerContents = document.getElementById(print_template).innerHTML;
		const popupWinindow = window.open();
		popupWinindow.document.open();
		popupWinindow.document.write('<html><head></head><body onload="window.print()">' + innerContents + '</html>');
		popupWinindow.document.write(`<style>
		@media print{
			@page {size: A4 landscape !important};		
		}
		td{
			border-right: 1px solid #dee2e6;
			border-bottom: 1px solid #dee2e6;
		}
		th{
			border-right: 1px solid #dee2e6;
			border-bottom: 1px solid #dee2e6;
		}
		table{
			border: 1px solid #dee2e6;
			border-collapse: collapse;
		}
		</style>
	  `);
		popupWinindow.document.close();
	}
}