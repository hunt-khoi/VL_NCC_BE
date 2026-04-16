import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CommentService } from '../comment.service';

@Component({
	selector: 'kt-comment-edit-dialog',
	templateUrl: './comment-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentEditDialogComponent implements OnInit {
	comment: any = {};
	viewLoading: boolean = false;
	
	constructor(
		public dialogRef: MatDialogRef<CommentEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private changeDetectorRefs: ChangeDetectorRef,
		private service: CommentService) {
	}

	async ngOnInit() {
		this.comment = this.data;
		this.changeDetectorRefs.detectChanges();
	}

	close(data = undefined) {
		this.dialogRef.close(data);
	}

	onSubmit() {
		this.service.update(this.comment).subscribe(res => {
			if (res && res.status == 1) {
				this.close(res.data);
			}
		});
	}
}