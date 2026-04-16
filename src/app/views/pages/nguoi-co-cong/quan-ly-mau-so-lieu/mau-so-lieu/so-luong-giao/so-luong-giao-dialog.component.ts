import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { MauSoLieuModel } from '../Model/mau-so-lieu.model';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-so-luong-giao-dialog',
	templateUrl: './so-luong-giao-dialog.component.html',
})

export class SoLuongGiaoDialogComponent implements OnInit {
	item: any;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	ListDV: Array<any> = [];
	ListGiao: Array<any> = [];
	IdDonVi: number;
	list_button: boolean;

	constructor(
		public dialogRef: MatDialogRef<SoLuongGiaoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private objectService: MauSoLieuService,
		private translate: TranslateService
	){}
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.item = this.data._item;
		this.ListDV = this.item.ListDonVi.filter(x => x.IsNhap);
		this.commonService.getStatusNhapSoLieu().subscribe(res => {
			if (res && res.status == 1) {
				this.lstStatus = res.data;
			}
		})
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.cacdvdanhap') + ' - ' + (this.item.NamVer ? 'Mẫu năm ' + this.item.NamVer : 'Mẫu gốc');
	}

	/** ACTIONS */

	DeleteWorkplace(_item: MauSoLieuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: "lần giao" });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: "lần giao" });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: "lần giao" });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: "Lần giao" });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteGiao(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.ngOnInit();
			});
		});
	}

	close() {
		this.dialogRef.close();
	}

	lstStatus: any[] = [];
	getStatusString(status) {
		var f = this.lstStatus.find(x => x.id == status);
		if (!f)
			return "";
		return f.data.color;
	}
}
