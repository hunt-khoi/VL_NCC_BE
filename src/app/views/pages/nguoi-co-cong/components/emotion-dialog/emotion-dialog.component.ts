import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
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
		private translate: TranslateService,
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