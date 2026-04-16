import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDatepicker } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { TinhHinhMuaBaoHiemService } from './Services/tinh-hinh-mua-bao-hiem.service';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
	selector: 'kt-tinh-hinh-mua-bao-hiem',
	templateUrl: './tinh-hinh-mua-bao-hiem.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class TinhHinhBaoHiemComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	strHtml: any;
	Loai: number = 0;
	TuThang: any;

	constructor(
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private service: TinhHinhMuaBaoHiemService,
		private commonService: CommonService,
		private sanitized: DomSanitizer) { }
	
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.TuThang = moment().startOf('month');
	}

	chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
		this.TuThang = normalizedMonth;
		datepicker.close();
	}

	view() {
		this.strHtml = "";
		this.loadingSubject.next(true);
		if (this.Loai == 0) {
			this.layoutUtilsService.showError("Hãy chọn loại báo cáo");
			return;
		}
		let tuthang = this.TuThang.format('YYYY-MM-DD');

		// this.service.getItem(tuthang, this.Loai).subscribe(res => {
		// 	this.loadingSubject.next(false);
		// 	if (res && res.status == 1) {
		// 		this.strHtml = this.sanitized.bypassSecurityTrustHtml(res.data);
		// 		this.changeDetect.detectChanges();
		// 	} else
		// 		this.layoutUtilsService.showError(res.error.message);
		// })
	}

	in(type) {
		this.loadingSubject.next(true);
		if (this.Loai == 0) {
			this.layoutUtilsService.showError("Hãy chọn loại báo cáo");
			return;
		}
		let tuthang = this.TuThang.format('YYYY-MM-DD');

		// this.service.export(tuthang, this.Loai, true, type).subscribe(response => {
		// 	this.loadingSubject.next(false);
		// 	const headers = response.headers;
		// 	const filename = headers.get('x-filename');
		// 	const type = headers.get('content-type');
		// 	const blob = new Blob([response.body], { type });
		// 	const fileURL = URL.createObjectURL(blob);
		// 	const link = document.createElement('a');
		// 	link.href = fileURL;
		// 	link.download = filename;
		// 	link.click();
		// });
	}
}
