import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { donvihanhchinhService } from '../Services/donvihanhchinh.service';
import { provincesModel } from '../Model/donvihanhchinh.model';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'm-provinces-edit-dialog',
	templateUrl: './provinces-edit.dialog.component.html',
})
export class provincesEditDialogComponent implements OnInit {
	item: provincesModel;
	oldItem: provincesModel
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	_name: string = "";

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

	constructor(public dialogRef: MatDialogRef<provincesEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private changeDetectorRefs: ChangeDetectorRef,
		private provincesService: donvihanhchinhService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant('PROVINCE.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit)
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
			ProvinceName: ['' + this.item.ProvinceName, Validators.required]
		});
		this.itemForm.controls["ProvinceName"].markAsTouched();
		if (!this.allowEdit)
			this.itemForm.disable();
	}
	/** UI */
	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}

		result = this.translate.instant('COMMON.UPDATE') + ` - ${this.item.ProvinceName}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): provincesModel {
		const controls = this.itemForm.controls;
		const _item = new provincesModel();
		_item.Id_row = this.item.Id_row;
		_item.ProvinceName = controls['ProvinceName'].value; // lấy tên biến trong formControlName
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
		const updateprovinces = this.prepareCustomer();
		if (updateprovinces.Id_row > 0) {
			this.Update(updateprovinces, withBack);
		} else {
			this.Create(updateprovinces, withBack);
		}
	}

	Update(_item: provincesModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.provincesService.UpdateProvinces(_item).subscribe(res => {
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
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE');
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(_item: provincesModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.provincesService.CreateProvinces(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE');
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
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
