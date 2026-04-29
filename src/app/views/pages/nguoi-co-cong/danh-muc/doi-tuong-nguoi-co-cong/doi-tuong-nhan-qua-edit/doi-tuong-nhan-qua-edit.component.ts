import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { DoiTuongNguoiCoCongService } from './../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongNguoiCoCongModel, DoiTuongNhanQuaModel } from './../Model/doi-tuong-nguoi-co-cong.model';

@Component({
  selector: 'kt-doi-tuong-nhan-qua-edit',
  templateUrl: './doi-tuong-nhan-qua-edit.component.html',
})
export class DoiTuongNhanQuaEditComponent implements OnInit {

  	item: DoiTuongNguoiCoCongModel = new DoiTuongNguoiCoCongModel();
	oldItem: DoiTuongNguoiCoCongModel = new DoiTuongNguoiCoCongModel();
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';

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
		public dialogRef: MatDialogRef<DoiTuongNhanQuaEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private apiService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONG_NCC.NAME');
	}

	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.apiService.getItemNhanQua(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	createForm() {
		const temp: any = {
			DoiTuong: ['' + this.item.DoiTuong?this.item.DoiTuong:'', Validators.required],
			MaDoiTuong: ['' + this.item.MaDoiTuong?this.item.MaDoiTuong:'', Validators.required],
			MoTa: ['' + this.item.MoTa?this.item.MoTa:''],
			Priority: [this.item.Priority?this.item.Priority:''],
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);
			if (this.focusInput)
				this.focusInput.nativeElement.focus();
		} else {
			temp.CreatedBy = ['' + this.item.CreatedBy];
			temp.CreatedDate = ['' + this.item.CreatedDate];
			temp.UpdatedBy = ['' + this.item.UpdatedBy];
			temp.UpdatedDate = ['' + this.item.UpdatedDate];
			this.itemForm = this.fb.group(temp);
			this.itemForm.disable();
			if (this.focusInput)
				this.focusInput.nativeElement.focus();
		}

	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng nhận quà`;
		return result;
	}

	prepare(): DoiTuongNguoiCoCongModel {
		if (!this.itemForm) return new DoiTuongNguoiCoCongModel();
		const controls = this.itemForm.controls;
		const _item = new DoiTuongNguoiCoCongModel();
		_item.Id = this.item.Id;
		_item.DoiTuong = controls.DoiTuong.value;
		_item.MaDoiTuong = controls.MaDoiTuong.value;
		_item.MoTa = controls.MoTa.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
		return _item;
	}

	onSubmit(withBack: boolean = false) {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}
		const Edit = this.prepare();
		if (Edit.Id > 0) {
			this.Update(Edit, withBack);
		} else {
			this.Create(Edit, withBack);
		}
	}

	Update(item: DoiTuongNhanQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.UpdateDoiTuongNhanQua(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				} else { 
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	Create(item: DoiTuongNhanQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.apiService.CreateDoiTuongNhanQua(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item: item });
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
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

	close() {
		this.dialogRef.close();
	}
}