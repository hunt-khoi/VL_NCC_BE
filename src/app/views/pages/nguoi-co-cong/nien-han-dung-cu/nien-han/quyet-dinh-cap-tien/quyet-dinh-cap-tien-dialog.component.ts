import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, Type, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { Moment } from 'moment';
import { NienHanService } from '../Services/nien-han.service';
import { QuyetDinhBaseEditComponent, ToTrinhEditComponent } from '../../../components';

@Component({
	selector: 'kt-quyet-dinh-cap-tien-dialog',
	templateUrl: './quyet-dinh-cap-tien-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuyetDinhCapTienDialogComponent implements OnInit {
	ChildComponentInstance: any;
	childComponentType: Type<any>;
	childComponentData: any = {};

	item: any;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = true;
	callapi = true;//update trên form hay k
	ngay1: Moment;
	ngay2: Moment;
	_NAME = '';
	isqd: boolean = true;

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

	constructor(
		public dialogRef: MatDialogRef<QuyetDinhCapTienDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private objectService: NienHanService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.IsQD != undefined) 
			this.isqd = this.data.IsQD;
		this._NAME = this.isqd ? this.translate.instant('QUYETDINH.NAME') : 'Tờ trình';
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.callapi != undefined)
			this.callapi = this.data.callapi;

		this.childComponentType = this.isqd ? QuyetDinhBaseEditComponent : ToTrinhEditComponent;
		this.childComponentData = Object.assign({}, this.data);
		this.childComponentData.objectService = this.objectService;
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE') + ' ' + this._NAME.toLowerCase();
		if (!this.allowEdit) {
			result = 'Xem chi tiết ' + this._NAME.toLowerCase();
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE') + ' ' + this._NAME.toLowerCase();
		return result;
	}
	onSubmit(withBack: boolean = false) {
		let EditQuyetDinh = this.ChildComponentInstance.onSubmit();
		if (EditQuyetDinh == undefined) {
			this.changeDetectorRefs.detectChanges();
		}
		if (!this.callapi) {
			this.dialogRef.close(EditQuyetDinh);
			return;
		}
		if (this.isqd) {
			this.CreateQuyetDinh(EditQuyetDinh, withBack);
		} else {
			this.CreateToTrinh(EditQuyetDinh, withBack);
		}
	}

	CreateQuyetDinh(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.objectService.taoQuyetDinh(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateToTrinh(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.objectService.taoToTrinh(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('100vw', '100vh');
			this.isZoomSize = true;
		} else if (this.isZoomSize) {
			this.dialogRef.updateSize('900px', 'auto');
			this.isZoomSize = false;
		}
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}

	getInstance($event) {
		this.ChildComponentInstance = $event;
	}
}
