import { Component, ChangeDetectionStrategy, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import { CommonService } from '../../services/common.service';
import { saveAs } from 'file-saver';

export class TodoItemNode {
	data?: TodoItemNode[];
	title: string = "";
	selected?: boolean;
	id?: any;
}
@Component({
	selector: 'kt-list-file-dinh-kem',
	templateUrl: './list-file-dinh-kem.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFileDinhKemComponent implements OnInit {
	viewLoading: boolean = false;
	isZoomSize: boolean = false;
	datasource = new MatTableDataSource<any>([]);
	displayedColumns: string[] = ["stt", "filename", "Version", "CreatedDate", "CreatedBy", "UpdatedDate", "UpdatedBy", "actions"];
 	files: Array<any> = [];

	constructor(
		public dialogRef: MatDialogRef<ListFileDinhKemComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private commonService: CommonService) { }

	async ngOnInit() {
		this.viewLoading = true;
		if (this.data) {
			this.commonService.get_dinhkem(this.data.Loai, this.data.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.files = res.data;
					this.datasource = new MatTableDataSource(this.files);
				}
				else
					this.layoutUtilsService.showError(res.error.message);
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
			})
		}
	}

	closeDialog() {
		this.dialogRef.close();
	}

	download(index: number) {
		this.commonService.download_dinhkem(this.files[index].IdRow).subscribe(res => {
			if (res && res.status == 1) {
				let blob = new Blob([res.data.FileContents], { type: res.data.ContentType });
				saveAs(blob, res.data.FileDownloadName);
			}
			else
				this.layoutUtilsService.showInfo(res.error.message);
		});
	}
}