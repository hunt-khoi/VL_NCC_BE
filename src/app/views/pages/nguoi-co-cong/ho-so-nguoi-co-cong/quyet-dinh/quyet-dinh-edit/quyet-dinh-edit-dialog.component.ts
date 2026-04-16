import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef, Type, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { Moment } from 'moment';
import { QuyetDinhService } from '../Services/quyet-dinh.service';
import { QuyetDinhEditComponent } from '../../../components';

@Component({
	selector: 'kt-quyet-dinh-edit-dialog',
	templateUrl: './quyet-dinh-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuyetDinhEditDialogComponent implements OnInit {

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
	listLoaiQuyetDinh: any[] = [];
	image: any;
	ngay1: Moment;
	ngay2: Moment;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	//type: trợ cấp: 1, cắt trợ cấp: 3 

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<QuyetDinhEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private commonService: CommonService,
		private objectService: QuyetDinhService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('QUYETDINH.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.callapi != undefined)
			this.callapi = this.data.callapi;

		this.childComponentType = QuyetDinhEditComponent;
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
		if (EditQuyetDinh.Id > 0) {
			this.UpdateQuyetDinh(EditQuyetDinh, withBack);
		} else {
			this.CreateQuyetDinh(EditQuyetDinh, withBack);
		}
	}

	UpdateQuyetDinh(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Update(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateQuyetDinh(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Create(_item).subscribe(res => {
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
					this.focusInput.nativeElement.focus();
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
