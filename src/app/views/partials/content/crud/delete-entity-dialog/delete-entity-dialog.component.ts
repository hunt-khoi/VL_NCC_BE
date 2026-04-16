import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'kt-delete-entity-dialog',
	templateUrl: './delete-entity-dialog.component.html'
})
export class DeleteEntityDialogComponent implements OnInit {
	viewLoading: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<DeleteEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit() {
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onYesClick(): void {
		this.viewLoading = true;
		//setTimeout(() => {
		this.dialogRef.close(true); // Keep only this row
		//}, 500);
	}
}