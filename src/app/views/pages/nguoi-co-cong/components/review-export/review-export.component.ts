import { Component, OnInit, ChangeDetectorRef, Inject, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

@Component({
	selector: 'kt-review-export',
	templateUrl: './review-export.component.html',
	encapsulation: ViewEncapsulation.None,
})
export class ReviewExportComponent implements OnInit {
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;
	strHtml: any;

	constructor(
		public dialogRef: MatDialogRef<ReviewExportComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private sanitized: DomSanitizer) { }

	transform(value: any) {
		return this.sanitized.bypassSecurityTrustHtml(value);
	}

	ngOnInit() {
		this.strHtml = this.sanitized.bypassSecurityTrustHtml(this.data)
	}

	//loai: 1 word, 2 excel, 3 pdf
	in(loai: number) {
		this.dialogRef.close({ loai: loai });
	}

	closeDialog() {
		this.dialogRef.close();
	}
}