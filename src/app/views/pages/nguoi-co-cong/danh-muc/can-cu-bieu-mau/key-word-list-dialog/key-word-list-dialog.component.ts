import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
	selector: 'kt-key-word-list-dialog',
	templateUrl: './key-word-list-dialog.component.html',
})
export class KeyWordListDialogComponent implements OnInit {
	item: any;
	_name = "Danh sách từ khóa";
	dataSource: any[] = [];
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	IsQua: boolean = false;

	constructor(public dialogRef: MatDialogRef<KeyWordListDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) {}

	ngOnInit() {
		if (this.data.IsQua != undefined)
			this.IsQua = this.data.IsQua;
	}

	close() {
		this.dialogRef.close();
	}
}
