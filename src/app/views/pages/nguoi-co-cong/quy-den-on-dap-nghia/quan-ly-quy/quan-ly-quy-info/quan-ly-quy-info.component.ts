// Angular
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatPaginator, MatSort } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Label } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';
import { DatePipe } from '@angular/common';
import { Moment } from 'moment';
import * as moment from 'moment';
// Service
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { CommonService } from './../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { DongGopQuyModel, QuyDenOnMoDel } from '../Model/dong-gop-quy.model';
import { QuanLyQuyService } from '../Services/quan-ly-quy.service';
import { QLQuyInfoEditDialogComponent } from './quan-ly-quy-info-edit/quan-ly-quy-info-edit-dialog.component';
import { QuanLyQuyInfoCanvasComponent } from './quan-ly-quy-info-canvas/quan-ly-quy-info-canvas.component';

@Component({
	selector: 'm-quan-ly-quy-info',
	templateUrl: './quan-ly-quy-info.component.html',
	styleUrls: ['quan-ly-quy-info.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QLQuyInfoComponent implements OnInit {

	// Selection
	productsResult: DongGopQuyModel[] = [];
	_name = '';
	pipe = new DatePipe('en-US');
	to: Moment;
	from: Moment;
	
	list_button: boolean;
	Capcocau: number;
	khoiTao: boolean = false;
	data_QDO: any;
	tsSeparator = '';
	Nam: number;
	IsAll: boolean = true;

	barChartOptions: ChartOptions = {
		responsive: true,
		
		plugins: {
			labels: {
				render: 'value',
				fontSize: 12,
				// fontStyle: 'bold',
				fontColor: '#000',
				fontFamily: '"Lucida Console", Monaco, monospace'
			},
			// datalabels: {
			// 	anchor: 'end',
			// 	align: 'end',
			// 	font: {
			// 	  size: 20,
			// 	}
			// }
		},
		
		scales:{
			yAxes: [{
				gridLines: {
				  display: true
				}, 
				ticks: {
					beginAtZero: true,
					// mirror: true,
				  	fontSize: 15,
					// labelOffset: -22
				}
			}],
			xAxes: [{
				gridLines: {
				  display: true
				}, 
				ticks: {
					// mirror: true,
				  	fontSize: 15,
					// labelOffset: -22
				}
			}]
		}
	};

	barChartLabels: Label[] = ['Thu', 'Chi', 'Tồn quỹ'];
	barChartType: ChartType = 'bar';
	barChartLegend = false; //tắt mở chú thích
	barChartPlugins = [];
	barChartData: any[] = [
		{ 
			data: [], 
			label: '',
			backgroundColor: []
		}
	];

	constructor(
		public objectService: QuanLyQuyService,
		public dialog: MatDialog,
		public commonService : CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
			this.tsSeparator = commonService.thousandSeparator
	}

	/** LOAD DATA */
	ngOnInit() {
		let tmp = moment();
		let y = tmp.get("year");
		this.from = moment(new Date(y, 0, 1));
		this.to = moment(new Date());
		
		this.data_QDO = new QuyDenOnMoDel();
		this.data_QDO.clear();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		});
		this.loadDataList();
	}

	loadDataList(){
		this.objectService.checkInit().subscribe(res=>{
			if (res.data) {
				this.khoiTao = true;
				this.changeDetectorRefs.detectChanges();
			} else {
				this.objectService.findData(new QueryParamsModel(this.filterConfiguration())).subscribe(res => {
					if (res.status == 1 && res.data) {
						this.khoiTao = false;
						this.data_QDO = res.data;
	
						this.barChartData = [
							{ 
								data: [this.data_QDO.TongThu, this.data_QDO.TongChi, this.data_QDO.TonQuy], 
								label: ['VND'],
								backgroundColor: ['#73e679', '#fd6d6b', '#fea45a'],
								hoverBackgroundColor: ['#38de41', '#ff3f3c', '#f38125'],
								borderColor: '#ffff',
							},		
						];
					}
					else {
						this.barChartData = [];
						this.layoutUtilsService.showError("Lấy thông tin quỹ thất bại");
					}
					this.changeDetectorRefs.detectChanges();
				})
			}
		})
	}


	filterConfiguration(): any {
		const filter: any = {};
		filter.TuNgay = this.pipe.transform(this.from.toDate(), 'dd/MM/yyyy');
		filter.DenNgay = this.pipe.transform(this.to.toDate(), 'dd/MM/yyyy');
		filter.IsAll = this.IsAll

		return filter;
	}

	modelChanged(event){
		this.from = event;
		this.loadDataList();
		
	}

	modelChanged1(event){
		this.to = event;
		this.loadDataList();
	}

	EditQuy () {
		let saveMessageTranslateParam = this.data_QDO.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
		const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
		const dialogRef = this.dialog.open(QLQuyInfoEditDialogComponent, { data: { _item: this.data_QDO, allowEdit: true } });
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.ngOnInit();
			}
			else
			{
				this.layoutUtilsService.showInfo(_saveMessage);
				this.ngOnInit();
			}
		});
 	}
	QuickAdd(){
		let item = new QuyDenOnMoDel();
		item.clear();
		this.objectService.CreateQuy(item).subscribe(res => {
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
				this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
				this.ngOnInit();
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	xem (ischi: boolean = false) {
		const dialogRef = this.dialog.open(QuanLyQuyInfoCanvasComponent, { 
			width: '55vw',
			data: { '_item': this.data_QDO, 'ischi': ischi } 
		});
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			}
		});
	}
}
