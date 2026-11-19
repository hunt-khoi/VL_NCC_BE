import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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

	export() {
		this.dialogRef.close(true);
	}

	closeDialog() {
		this.dialogRef.close();
	}
}