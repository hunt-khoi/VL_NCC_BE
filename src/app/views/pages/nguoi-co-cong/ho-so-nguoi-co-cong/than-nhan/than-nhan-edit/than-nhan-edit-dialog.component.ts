import { Component, OnInit, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Type, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { ThanNhanService } from './../Services/than-nhan.service';
import { ThanNhanModel } from '../../than-nhan/Model/than-nhan.model';
import { ThanNhanEditComponent } from '../../../components/than-nhan-edit/than-nhan-edit.component';

@Component({
	selector: 'kt-than-nhan-edit-dialog',
	templateUrl: './than-nhan-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThanNhanEditDialogComponent implements OnInit {

	ChildComponentInstance: any;
	childComponentType: Type<any>;
	childComponentData: any = {};
	item: ThanNhanModel;
	oldItem: ThanNhanModel;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	_NAME = '';

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


	constructor(
		public dialogRef: MatDialogRef<ThanNhanEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private commonService: CommonService,
		private objectService: ThanNhanService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('THANNHAN.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;

		this.childComponentType = ThanNhanEditComponent;
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

	/** ACTIONS */
	onSubmit(withBack: boolean = false) {
		let EditTroCap = this.ChildComponentInstance.onSubmit();
		if (EditTroCap == undefined) {
			this.changeDetectorRefs.detectChanges();
		}
		else {
			if (EditTroCap.Id > 0) {
				this.UpdateThanNhan(EditTroCap, withBack);
			} else {
				this.CreateThanNhan(EditTroCap, withBack);
			}
		}
	}

	UpdateThanNhan(_item: ThanNhanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateThanNhan(_item).subscribe(res => {
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
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateThanNhan(_item: ThanNhanModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateThanNhan(_item).subscribe(res => {
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
