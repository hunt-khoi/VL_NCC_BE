import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'kt-display-html-content',
	templateUrl: './display-html-content.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class DisplayHtmlContentComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	strHtml: any;
	title: any;

	constructor(
		public dialogRef: MatDialogRef<DisplayHtmlContentComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private sanitized: DomSanitizer) { }

	transform(value: any) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	ngOnInit() {
		this.title = this.data.title;
		this.strHtml=this.sanitized.bypassSecurityTrustHtml(this.data.html)
	}
	
	closeDialog() {
		this.dialogRef.close();
	}
}