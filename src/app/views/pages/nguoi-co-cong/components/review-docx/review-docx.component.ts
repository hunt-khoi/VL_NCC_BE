import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
	selector: 'kt-review-docx',
	templateUrl: './review-docx.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class ReviewDocxComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;

	strHtml: any;
	constructor(
		public dialogRef: MatDialogRef<ReviewDocxComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private sanitized: DomSanitizer) { }

	transform(value: any) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	ngOnInit() {
		this.strHtml = this.sanitized.bypassSecurityTrustHtml(this.data)
	}

	in() {
		this.dialogRef.close(true);
	}

	closeDialog() {
		this.dialogRef.close();
	}
}