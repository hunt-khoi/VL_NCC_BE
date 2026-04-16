import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dantocModel } from '../../dantoc/Model/dantoc.model';
import { TranslateService } from '@ngx-translate/core';
import { dantocService } from '../Services/dantoc.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-dantoc-edit-dialog',
	templateUrl: './dantoc-edit.dialog.component.html',
})

export class dantocEditDialogComponent implements OnInit {
	item: dantocModel;
	oldItem: dantocModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	_NAME: '';

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

	constructor(public dialogRef: MatDialogRef<dantocEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private dantocService: dantocService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DANTOC.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {

		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.item.Id_row > 0) {
			this.viewLoading = true;
		}
		else {
			this.viewLoading = false;
		}
		this.createForm();
		this.focusInput.nativeElement.focus();
	}

	createForm() {

		this.itemForm = this.fb.group({
			Tendantoc: ['' + this.item.Tendantoc, Validators.required],
			Priority: ['' + this.item.Priority]
		});
		if (!this.allowEdit)
			this.itemForm.disable()
	}
	/** UI */
	getTitle(): string {
		if (!this.allowEdit)
			return 'Xem chi tiết';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE') + ` - Tên dân tộc: ${this.item.Tendantoc}`;
		return result;
	}
	
	/** ACTIONS */
	prepareCustomer(): dantocModel {

		const controls = this.itemForm.controls;
		const _item = new dantocModel();
		_item.Id_row = this.item.Id_row;
		_item.Tendantoc = controls['Tendantoc'].value; // lấy tên biến trong formControlName
		_item.Priority = controls['Priority'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const updatedantoc = this.prepareCustomer();
		if (updatedantoc.Id_row > 0) {
			this.Update(updatedantoc, withBack);
		} else {
			this.Create(updatedantoc, withBack);
		}
	}

	Update(_item: dantocModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dantocService.UpdateDanToc(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: dantocModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.dantocService.CreateDanToc(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}

			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
