import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonService } from '../nguoi-co-cong/services/common.service';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label } from 'ng2-charts';
import { Router } from '@angular/router';
import { SignalRService } from '../nguoi-co-cong/services/signalR.service';
import { QueryParamsModel } from '../../../core/_base/crud';
import 'chartjs-plugin-labels';

@Component({
	selector: 'kt-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['dashboard.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None

})
export class DashboardComponent implements OnInit {
	ThongKeDashboard: any[] = [];
	loadImg: boolean = true;
	optionsTmp: ChartOptions = {
		responsive: true,
		plugins: {
			labels: {
				render: 'value',
				fontSize: 14,
				fontStyle: 'bold',
				fontColor: '#000',
				fontFamily: '"Lucida Console", Monaco, monospace'
			}
		}
	};
	pieChartType: ChartType = 'pie';
	pieChartLegend: boolean = true;
	pieChartLabels: Label[] = ['Hoàn thành đúng hạn', 'Hoàn thành trễ hạn', 'Đang xử lý', 'Trễ hạn'];
	pieChartData: SingleDataSet[] = [];
	dataTitle: string[] = [];
	lastestFeedback: any[] = [];
	queryFB: QueryParamsModel = new QueryParamsModel({});
	pageTotalFB: number = 0;
	isStopScroll: boolean = false;
	scrollTop: boolean = false;
	@ViewChild('scrollView', { static: false }) scrollView: ElementRef | undefined;
	@HostListener('scroll', ['$event'])

	images: any; 
    responsiveOptions;
	data_thongke: any;
	currentIndex: number = 0;

	constructor(
		private router: Router,
		private commonService: CommonService,
		private signalRService: SignalRService,
		private changeDetectorRefs: ChangeDetectorRef) {
			this.responsiveOptions = [{
				breakpoint: '1024px',
				numVisible: 1,
				numScroll: 3
			}];
	}

	ngOnInit(): void {
		this.queryFB.sortOrder = "desc";
		this.queryFB.sortField = "CreatedDate";
		this.queryFB.pageNumber = 0;
		this.queryFB.pageSize = 10;
		this.commonService.ThongKeDasboard().subscribe(res => {
			if (res.status == 1) {
				this.data_thongke = [];
				this.ThongKeDashboard = res.data;
				let size = res.data.length;
				let i = 0;
				// let x = size % 4;
				while (i < size) {
					let temp: any;
					let index = i + 3; //i+4
					if (index > size) { 
						temp = res.data.slice(i);
						temp = temp.concat(res.data.slice(0, index - size));
					}
					else {
						temp = res.data.slice(i, i+4);
					}
					i = i+1;
					this.data_thongke.push(temp);
				}
				this.currentIndex = 0;
				this.changeDetectorRefs.detectChanges();
			}
		});

		this.commonService.BieuDoThongKeVanBan().subscribe(res => {
			if (res.status == 1) {
				let _data = res.data;
				_data.forEach((x: any) => {
					let pieChartData: SingleDataSet;
					pieChartData = [x.HTDungHan, x.HTTreHan, x.DangLam, x.TreHan];
					this.pieChartData.push(pieChartData);
					this.dataTitle.push(x.Title);
				});
				this.changeDetectorRefs.detectChanges();
			}
		});

		this.getListFeedBack();
		this.signalRService.notifyReceived.subscribe((res: any) => {
			this.getListFeedBackLastest();
		})
	}

	scrollViewHandler() {
		if (this.scrollView && this.scrollView.nativeElement.scrollTop > 0) {
			this.scrollTop = true;
		}
		else {
			this.scrollTop = false;
		}
		if (this.isStopScroll || !this.scrollView) return;
		let total = this.scrollView.nativeElement.scrollHeight - this.scrollView.nativeElement.offsetHeight;
		try {
			if (this.scrollView.nativeElement.scrollTop + 5 >= total) {
				if (total > 0) {
					if (this.queryFB.pageNumber < (this.pageTotalFB / this.queryFB.pageSize)) {
						this.queryFB.pageNumber++;
						this.getListFeedBack(true);
					}
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	getListFeedBack(more: boolean = false) {
		this.queryFB.filter.lastID = "";
		this.commonService.LastestFeedbackDasboard(this.queryFB).subscribe(res => {
			if (res.status == 1) {
				if (more) {
					this.lastestFeedback = this.lastestFeedback.concat(res.data);
				}
				else {
					this.lastestFeedback = res.data;
				}
				this.pageTotalFB = res.page.TotalCount;
				this.changeDetectorRefs.detectChanges();
			}
		})
	}

	getListFeedBackLastest() {
		this.queryFB.filter.lastID = this.lastestFeedback[0].IdRow;
		this.commonService.LastestFeedbackDasboard(this.queryFB).subscribe(res => {
			if (res.status == 1) {
				if (res.data && res.data.length > 0) {
					res.data.forEach((element: any) => {
						this.lastestFeedback.unshift(element);
					});
				}
				this.pageTotalFB = res.page.TotalCount;
				this.changeDetectorRefs.detectChanges();
			}
		})
	}

	onChangePage(event: any) {
		this.queryFB.pageNumber = event.pageIndex;
		this.getListFeedBack();
	}

	ReadFeedBack(item: any) {
		this.commonService.ReadNotify(item.IdRow).subscribe(_ => {
			this.router.navigate([item.Link, {}]);
		})
	}

	ScrollTop() {
		if (this.scrollView)
			this.scrollView.nativeElement.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
	}

	timer: any;
	scrollDiv(elementToScroll: HTMLElement, event: any, depl: number) {
		if (elementToScroll.scrollLeft + depl == elementToScroll.scrollLeft) 
			elementToScroll.scrollLeft -= depl;
		else 
			elementToScroll.scrollLeft += depl;

		this.timer = Number(setTimeout(() => {
			this.scrollDiv(elementToScroll, event, depl)
		}, 100));
	} 
}