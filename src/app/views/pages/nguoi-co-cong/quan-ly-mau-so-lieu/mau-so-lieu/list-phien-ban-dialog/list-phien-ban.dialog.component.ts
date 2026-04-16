import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { MauSoLieuService } from '../Services/mau-so-lieu.service';
import { CommonService } from '../../../services/common.service';

@Component({
	selector: 'm-list-phien-ban-dialog',
	templateUrl: './list-phien-ban.dialog.component.html',
})

export class ListPhienBanDialogComponent implements OnInit {
	item: any;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	list_button: boolean;
	lstVer: any[] = [];
	_NAME: string = '';
	isZoomSize: boolean;

	constructor(public dialogRef: MatDialogRef<ListPhienBanDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private objectService: MauSoLieuService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('MAU_SO_LIEU.maunhap')
	}

	/** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.item.Id > 0) {
			this.objectService.getListMauSoLieuDetailByIdMauSoLieu(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				if (res && res.status == 1) {
					this.lstVer = res.dataExtra;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
		else {
			this.viewLoading = false;
		}
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('MAU_SO_LIEU.dsphienban') +  ' - ' + this.item.MauSoLieu;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}

	/** Delete */
	Delete(_item: any) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._NAME.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._NAME.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._NAME.toLowerCase() });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.xoa(_item.id);
		});
	}

	xoa(id, Force: boolean = false) {
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._NAME });

		this.objectService.deleteItem(id, Force).subscribe(res => {
			if (res && res.status === 1) {
				this.layoutUtilsService.showInfo(_deleteMessage);
				this.ngOnInit();
			}
			else {
				if (res.error.allowForce) {
					const dialogRef = this.layoutUtilsService.deleteElement("Cảnh báo", res.error.message, 'Yêu cầu đang được xử lý');
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						this.xoa(id, true);
					});

				} else
					this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
}
