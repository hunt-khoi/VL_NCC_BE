import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, Type } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';
import { Moment } from 'moment';
import { QuaTrinhHoatDongService } from '../Services/qua-trinh-hoat-dong.service';
import { QuaTrinhHoatDongEditComponent } from '../../../components';

@Component({
	selector: 'kt-qua-trinh-hoat-dong-edit-dialog',
	templateUrl: './qua-trinh-hoat-dong-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuaTrinhHoatDongEditDialogComponent implements OnInit {

	ChildComponentInstance: any;
	childComponentType: Type<any>;
	childComponentData: any = {};
	item: any;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS: Moment;
	default: number = 0;
	ngay1: Moment;
	ngay2: Moment;

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


	constructor(public dialogRef: MatDialogRef<QuaTrinhHoatDongEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private commonService: CommonService,
		private objectService: QuaTrinhHoatDongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('QT_HOATDONG.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.childComponentType = QuaTrinhHoatDongEditComponent;
		this.childComponentData = Object.assign({}, this.data);
		this.childComponentData.objectService = this.objectService;
		this.changeDetectorRefs.detectChanges();
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
		if (EditTroCap == undefined) {
			this.changeDetectorRefs.detectChanges();
		}
		else {
			if (EditTroCap.Id > 0) {
				this.UpdateHoatDong(EditTroCap, withBack);
			} else {
				this.CreateHoatDong(EditTroCap, withBack);
			}
		}
	}

	UpdateHoatDong(_item: any, withBack: boolean) {
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

	CreateHoatDong(_item: any, withBack: boolean) {
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
	
	close() {
		this.dialogRef.close();
	}

	getInstance($event) {
		this.ChildComponentInstance = $event;
	}
}
