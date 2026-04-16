import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HolidaysModel } from '../../ngay-le/Model/ngay-le.model';
import { TranslateService } from '@ngx-translate/core';
import { HolidaysService } from '../Services/ngay-le.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
@Component({
	selector: 'm-ngay-le-edit-dialog',
	templateUrl: './ngay-le-edit.dialog.component.html',
})

export class HolidaysEditDialogComponent implements OnInit {
	item: HolidaysModel = new HolidaysModel();
	oldItem: HolidaysModel = new HolidaysModel();
	itemForm: FormGroup | undefined;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	change: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
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

	constructor(public dialogRef: MatDialogRef<HolidaysEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private apiService: HolidaysService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._name = this.translate.instant("CAP_QL.NAME");
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id_row > 0) {
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id_row).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			Title: ['' + this.item.Title],
			Ngay: ['' + this.item.Ngay],
			GhiChu: [this.item.GhiChu],
		});
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	/** UI */
	getTitle(): string {
		if (!this.allowEdit) return 'Xem chi tiết';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_row) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` - ${this.item.Title}`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): HolidaysModel {
		const controls = this.itemForm.controls;
		const _item = new HolidaysModel();
		_item.Id_row = this.item.Id_row;
		_item.Title = controls['Title'].value; 
		_item.Ngay = controls['Ngay'].value;
		_item.GhiChu = controls['GhiChu'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		const EditCapQuanLy = this.prepareCustomer();
		if (EditCapQuanLy.Id_row > 0) {
			this.Update(EditCapQuanLy, withBack);
		} else {
			this.Create(EditCapQuanLy, withBack);
		}
	}

	Update(item: HolidaysModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				}
				else {
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: HolidaysModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						item
					});
				}
				else {
					this.change = true;
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
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
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close(this.change);
	}
}
