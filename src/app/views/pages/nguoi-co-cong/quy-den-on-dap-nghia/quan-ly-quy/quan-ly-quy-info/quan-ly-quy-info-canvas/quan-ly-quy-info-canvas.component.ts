import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';

@Component({
	selector: 'm-quan-ly-quy-info-canvas',
	templateUrl: './quan-ly-quy-info-canvas.component.html',
})

export class QuanLyQuyInfoCanvasComponent implements OnInit {
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	_name = '';
	UserInfo: any;
	ischi: boolean = false;

    listColor = [ '#8cfd54', 'rgb(124, 181, 236)', '#f7fd4d'];
    pieChartData = [];
    pieChartLabel: string[] = [];
    pieChartOptions = { cutoutPercentage: 40 }; //Number 50 - for doughnut, 0 - for pie
    pieChartLegend = true;
    pieChartColor = [{
        backgroundColor: this.listColor,
    }];
    pieChartType = 'pie';
    item: any;

	constructor(
		public dialogRef: MatDialogRef<QuanLyQuyInfoCanvasComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private activateRoute: ActivatedRoute,
		private translate: TranslateService) {
			this._name = 'Biểu đồ chi tiết';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.ischi = this.data.ischi;
		if (this.ischi) {
			this.pieChartData.push(this.item.Chi);
			this.pieChartData.push(this.item.ChiTuHoTro);
			this.pieChartData.push(this.item.ChiHoTro);
			this.pieChartLabel = ['Chi không từ hỗ trợ', 'Chi từ hỗ trợ', 'Chi hỗ trợ cấp dưới']
		}
		else {
			this.pieChartData.push(this.item.Thu);
			this.pieChartData.push(this.item.NhanHoTro);
			this.pieChartLabel = ['Vận động đóng góp', 'Nhận từ hỗ trợ']
		}
	}

	/** UI */
	getTitle(): string {
		return this._name + (this.ischi ? ' chi' : ' thu');
	}

	closeForm() {
		this.dialogRef.close();
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
