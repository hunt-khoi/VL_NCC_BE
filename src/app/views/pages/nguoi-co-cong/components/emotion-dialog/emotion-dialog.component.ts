import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CommonService } from '../../services/common.service';


@Component({
	selector: 'kt-emotion-dialog',
	templateUrl: './emotion-dialog.component.html',
})
export class EmotionDialogComponent implements OnInit {
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	ListEmotion: any[] = [];

	constructor(public dialogRef: MatDialogRef<EmotionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private service: CommonService) { }

	ngOnInit() {
		this.service.lite_emotion().subscribe(res => {
			if(res && res.data)
				this.ListEmotion = res.data;
		})
	}

	close() {
		this.dialogRef.close();
	}

	select(key: any) {
		this.dialogRef.close(key);
	}
}