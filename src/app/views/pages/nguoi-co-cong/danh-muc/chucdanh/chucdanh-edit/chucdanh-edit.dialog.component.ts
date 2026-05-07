import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ChucDanhModel } from '../Model/chucdanh.model';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ChucDanhService } from '../Services/chucdanh.service';

@Component({
	selector: 'm-chucdanh-edit-dialog',
	templateUrl: './chucdanh-edit.dialog.component.html',
})

export class ChucDanhEditDialogComponent implements OnInit {
	item: ChucDanhModel = new ChucDanhModel();
	oldItem: ChucDanhModel = new ChucDanhModel();
	itemForm: FormGroup | undefined;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef | undefined;
	_name = "";

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

	constructor(public dialogRef: MatDialogRef<ChucDanhEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private apiService: ChucDanhService,
		private changeDetectorRefs: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("CHUC_DANH.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id_CV > 0) {
			this.viewLoading = true;
			this.apiService.getItem(this.item.Id_CV).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			MaCV: ['' + this.item.MaCV, Validators.required],
			TenCV: ['' + this.item.TenCV, Validators.required],
			Cap: [this.item.Cap, Validators.pattern(/^-?(0|[1-9]\d*)?$/)],
			IsManager: [this.item.IsManager],
		});
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (!this.allowEdit) return 'Xem chi tiết';
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id_CV) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ' - ' + this.item.TenCV;
		return result;
	}

	prepare(): ChucDanhModel {
		if (!this.itemForm) return new ChucDanhModel();
		const controls = this.itemForm.controls;
		const _item = new ChucDanhModel();
		_item.Id_CV = this.item.Id_CV;
		_item.MaCV = controls['MaCV'].value; // lấy tên biến trong formControlName
		_item.TenCV = controls['TenCV'].value;
		_item.Cap = controls['Cap'].value;
		_item.IsManager = controls['IsManager'].value;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const Edit = this.prepare();
		if (Edit.Id_CV > 0) {
			this.Update(Edit, withBack);
		} else {
			this.Create(Edit, withBack);
		}
	}

	Update(item: ChucDanhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.Update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
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

	Create(item: ChucDanhModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.apiService.Create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		if (!this.itemForm) return;
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}

	close() {
		this.dialogRef.close();
	}
}