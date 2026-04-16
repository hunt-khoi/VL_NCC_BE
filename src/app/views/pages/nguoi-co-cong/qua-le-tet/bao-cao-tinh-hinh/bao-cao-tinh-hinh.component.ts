import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// Material
import { MatDialog } from '@angular/material';
import { merge, BehaviorSubject } from 'rxjs';
//Service
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { DomSanitizer } from '@angular/platform-browser';
import { BaoCaoTinhHinhService } from './Services/bao-cao-tinh-hinh.service';

@Component({
	selector: 'kt-bao-cao-tinh-hinh',
	templateUrl: './bao-cao-tinh-hinh.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class BaoCaoTinhHinhComponent implements OnInit {

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	IdDotTangQua: number=0;
	lstDot: any[] = [];
	strHtml: any;

	constructor(
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private service: BaoCaoTinhHinhService,
		private commonService: CommonService,
		private sanitized: DomSanitizer) { }
		
	transform(value) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	/** LOAD DATA */
	ngOnInit() {
		this.commonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
	}

	view() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.strHtml = "";
		this.loadingSubject.next(true);
		this.service.getItem(this.IdDotTangQua).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.strHtml = this.sanitized.bypassSecurityTrustHtml(res.data);
				this.changeDetect.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	in() {
		this.loadingSubject.next(true);
		this.service.export(this.IdDotTangQua).subscribe(response => {
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
