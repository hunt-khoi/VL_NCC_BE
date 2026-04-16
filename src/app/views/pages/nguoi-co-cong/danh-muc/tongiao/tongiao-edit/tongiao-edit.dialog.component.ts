import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tongiaoModel } from '../Model/tongiao.model';
import { TranslateService } from '@ngx-translate/core';
import { tongiaoService } from '../Services/tongiao.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-tongiao-edit-dialog',
	templateUrl: './tongiao-edit.dialog.component.html',
})

export class tongiaoEditDialogComponent implements OnInit {

	item: tongiaoModel;
	oldItem: tongiaoModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	_NAME: '';

	constructor(public dialogRef: MatDialogRef<tongiaoEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private tongiaoService: tongiaoService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('TONGIAO.NAME');
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
			Tentongiao: ['' + this.item.Tentongiao, Validators.required],
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

		result = this.translate.instant('COMMON.UPDATE') + ` - Tên tôn giáo: ${this.item.Tentongiao}`;
		return result;
	}
	/** ACTIONS */
	prepareCustomer(): tongiaoModel {

		const controls = this.itemForm.controls;
		const _item = new tongiaoModel();
		_item.Id_row = this.item.Id_row;
		_item.Tentongiao = controls['Tentongiao'].value; // lấy tên biến trong formControlName
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
		const updatedegree = this.prepareCustomer();
		if (updatedegree.Id_row > 0) {
			this.Update(updatedegree, withBack);
		} else {
			this.Create(updatedegree, withBack);
		}
	}

	Update(_item: tongiaoModel, withBack: boolean) {

		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.tongiaoService.UpdateTonGiao(_item).subscribe(res => {
			/* Server loading imitation. Remove this on real code */

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

	Create(_item: tongiaoModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.tongiaoService.CreateTonGiao(_item).subscribe(res => {
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
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close();
	}
	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13)//phím Enter
		{
			this.item = this.data._item;
			if (this.viewLoading == true) {
				this.onSubmit(true);
			}
			else {
				this.onSubmit(false);
			}
		}
	}
}
