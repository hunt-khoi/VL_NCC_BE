import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { TinhHinhTrangCapService } from './Services/tinh-hinh-trang-cap.service';
import moment from 'moment';

@Component({
	selector: 'kt-tinh-hinh-trang-cap',
	templateUrl: './tinh-hinh-trang-cap.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class TinhHinhTrangCapComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	Nam: number;
	strHtml: any;

	constructor(
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private service: TinhHinhTrangCapService,
		private commonService: CommonService,
		private sanitized: DomSanitizer) { }
	
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.Nam = moment().get("year");
	}

	view() {
		this.strHtml = "";
		this.loadingSubject.next(true);
		this.service.getItem(this.Nam).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.strHtml = this.sanitized.bypassSecurityTrustHtml(res.data);
				this.changeDetect.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	in(type) {
		this.loadingSubject.next(true);
		this.service.export(this.Nam, true, type).subscribe(response => {
			this.loadingSubject.next(false);
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại")
		});
	}
}
