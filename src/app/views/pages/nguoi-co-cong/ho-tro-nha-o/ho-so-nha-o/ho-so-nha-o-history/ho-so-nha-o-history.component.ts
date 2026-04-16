import { HoSoNhaOService } from '../Services/ho-so-nha-o.service';
import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { HoSoNhaOModel } from '../Model/ho-so-nha-o.model';
import { HoSoNhaOSupportDialogComponent } from '../ho-so-nha-o-support/ho-so-nha-o-support-dialog.component';

@Component({
	selector: 'kt-ho-so-nha-o-history',
	templateUrl: './ho-so-nha-o-history.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOHistoryComponent implements OnInit {
	item: any;
	hasFormErrors = false;
	viewLoading = false;
	disabledBtn = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	_NAME = '';
	listLS = []
	tongHoTro: number = 0;
	isAction = false;
	
	constructor(
		public dialogRef: MatDialogRef<HoSoNhaOHistoryComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private objectService: HoSoNhaOService,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		public dialog: MatDialog,
		private translate: TranslateService) {
		this._NAME = 'Chi tiết hỗ trợ';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data.item;
		this.loadList();
	}

	loadList() {
		this.tongHoTro = 0;
		this.objectService.getHoTro(this.item.Id).subscribe(res => {
			if (res && res.status == 1) {
				this.listLS = res.data;
				this.listLS.forEach(x => {
					this.tongHoTro += x.SoTien
				});
				this.isAction = this.listLS.filter(x => x.AllowEdit).length > 0;
				this.changeDetectorRefs.detectChanges();
			}
		});
	}

	/** UI */
	getTitle(): string {
		return this._NAME;
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}
	Export() {
		this.objectService.exportCTHoTro(this.item.Id).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		});
	}


	DeleteWorkplace(_item) {
		let _name = "Hỗ trợ nhà ở";
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: _name });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: _name });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: _name });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: _name });

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}

			this.objectService.deleteHoTro(_item.Id).subscribe(res => {
				if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
				}
				else {
					this.layoutUtilsService.showError(res.error.message);
				}
				this.loadList();
			});
		});
	}

	EditObject(_item: any, allowEdit: boolean = true) {
		const _saveMessage = 'Sửa hỗ trợ nhà ở thành công';
		const dialogRef = this.dialog.open(HoSoNhaOSupportDialogComponent, { data: { _item, allowEdit } });
		dialogRef.componentInstance.IsSua = true;
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
			} else {
				this.layoutUtilsService.showInfo(_saveMessage);
				this.loadList();
			}
		});
	}
}
