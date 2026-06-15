import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { BaoCaoTinhHinhService } from './Services/bao-cao-tinh-hinh.service';

@Component({
	selector: 'kt-bao-cao-tinh-hinh',
	templateUrl: './bao-cao-tinh-hinh.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class BaoCaoTinhHinhComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isZoomSize: boolean = false;
	IdDotTangQua: number = 0;
	lstDot: any[] = [];
	strHtml: any;

	constructor(
		public dialog: MatDialog,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private service: BaoCaoTinhHinhService,
		private commonService: CommonService,
		private sanitized: DomSanitizer) { }
		
	transform(value: any) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	ngOnInit() {
		this.commonService.liteDotQua(true).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	view() {
		if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.strHtml = "";
		this.loadingSubject.next(true);
		this.service.getItem(this.IdDotTangQua).pipe(takeUntil(this.destroy$)).subscribe(res => {
			this.loadingSubject.next(false);
			if (res && res.status == 1) {
				this.strHtml = this.sanitized.bypassSecurityTrustHtml(res.data);
				this.changeDetect.detectChanges();
			} else
				this.layoutUtilsService.showError(res.error.message);
		})
	}

	export() {
		this.loadingSubject.next(true);
		this.service.export(this.IdDotTangQua).pipe(takeUntil(this.destroy$)).subscribe(response => {
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