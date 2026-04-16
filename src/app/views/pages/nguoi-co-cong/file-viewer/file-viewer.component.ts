import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, SecurityContext, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../services/common.service';
import { LayoutUtilsService } from '../../../../core/_base/crud';
import { DomSanitizer } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

@Component({
	selector: 'kt-file-viewer',
	templateUrl: './file-viewer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileViewerComponent implements OnInit, AfterViewInit {
	IdRow: number = 0;
	src: any;
	Url: any;
	@ViewChild('iframeRef', { static: false }) iframeRef!: ElementRef;
	private checkIFrameSubscription: Subscription | null = null;

	constructor(
		private activatedRoute: ActivatedRoute,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		public commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private sanitizer: DomSanitizer
	) {
		this.dialog.closeAll();
	}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			if (params.path) {
				this.Url = params.path;
				this.changeDetectorRefs.detectChanges();
			}
			if (params.id && params.id != '0') {
				this.IdRow = params.id;
				this.getUrl();
			}
		});
	}

	ngAfterViewInit() {
		let iframe = (this.iframeRef) ? this.iframeRef.nativeElement : null;
		this.checkIFrame(iframe);
		this.checkIFrameSubscription = interval(3000)
			.pipe(take(Math.round(20000 / 3000)))
			.subscribe(() => {
				if (iframe == null) {
					iframe = (this.iframeRef) ? this.iframeRef.nativeElement : null;
					this.checkIFrame(iframe);
				}
				this.reloadIFrame(iframe);
			});
	}

	checkIFrame(iframe: any) {
		if (iframe) {
			iframe.onload = () => {
				if (this.checkIFrameSubscription) {
					this.checkIFrameSubscription.unsubscribe();
				}
			};
		}
	}

	reloadIFrame(iframe: any) {
		if (iframe) {
			const src = 'https://view.officeapps.live.com/op/view.aspx?src=' + this.Url;
			iframe.src = src;
		}
	}

	async getDetail() {
		return await this.commonService.view_dinhkem(this.IdRow).toPromise();
	}

	async getUrl() {
		await this.getDetail().then(res => {
			if (res && res.status == 1) {
				const src = 'https://view.officeapps.live.com/op/view.aspx?src=' + res.data;
				this.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.sanitizer.sanitize(SecurityContext.URL, src) as string);
				this.changeDetectorRefs.detectChanges();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	download() {
		window.open(this.Url);
	}
}