import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'kt-key-word-list-dialog',
	templateUrl: './key-word-list-dialog.component.html',
})
export class KeyWordListDialogComponent implements OnInit {
	_name: string = "Danh sách từ khóa";
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
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