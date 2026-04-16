import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, Type } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DiChuyenEditComponent } from '../../../components';
import { DiChuyenService } from '../Services/di-chuyen.service';

@Component({
	selector: 'kt-di-chuyen-edit-dialog',
	templateUrl: './di-chuyen-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DiChuyenEditDialogComponent implements OnInit {

	ChildComponentInstance: any;
	childComponentType: Type<any>;
	childComponentData: any = {};
	item: any;
	ncc: any = {};
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS: Moment;

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

	constructor(public dialogRef: MatDialogRef<DiChuyenEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private objectService: DiChuyenService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DICHUYEN.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.childComponentType = DiChuyenEditComponent;
		this.childComponentData = Object.assign({}, this.data);
		this.childComponentData.objectService = this.objectService;
	}

	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE');
		return result;
	}

	onSubmit(withBack: boolean = false) {
		let EditTroCap = this.ChildComponentInstance.onSubmit();
		if (EditTroCap.Id > 0) {
			this.UpdateTroCap(EditTroCap, withBack);
		} else {
			this.CreateTroCap(EditTroCap, withBack);
		}
	}

	UpdateTroCap(_item: any, withBack: boolean) {
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

	CreateTroCap(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
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
