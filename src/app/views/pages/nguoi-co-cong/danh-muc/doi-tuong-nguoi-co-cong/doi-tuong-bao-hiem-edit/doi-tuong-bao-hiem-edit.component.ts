import { DoiTuongNguoiCoCongService } from './../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongBHYTModel } from './../Model/doi-tuong-nguoi-co-cong.model';
import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';

@Component({
  selector: 'kt-doi-tuong-bao-hiem-edit',
  templateUrl: './doi-tuong-bao-hiem-edit.component.html',
})

export class DoiTuongBaoHiemEditComponent implements OnInit {

  	item: DoiTuongBHYTModel;
	oldItem: DoiTuongBHYTModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	type: number = 1;

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
		public dialogRef: MatDialogRef<DoiTuongBaoHiemEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONGBHYT.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.type = this.data.type;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.doiTuongNguoiCoCongService.getItemBHYT(this.item.Id).subscribe(res => {
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
			DoiTuong: ['' + this.item.DoiTuong ? this.item.DoiTuong : '', Validators.required],
			MaDoiTuong: ['' + this.item.MaDoiTuong ? this.item.MaDoiTuong : ''],
			MoTa: ['' + this.item.MoTa ? this.item.MoTa : ''],
			Priority: [this.item.Priority ? this.item.Priority : ''],
			Type: [this.type],
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);
			this.itemForm.controls.Type.disable();
			this.focusInput.nativeElement.focus();
		} else {
			temp.CreatedBy = ['' + this.item.CreatedBy];
			temp.CreatedDate = ['' + this.item.CreatedDate];
			temp.UpdatedBy = ['' + this.item.UpdatedBy];
			temp.UpdatedDate = ['' + this.item.UpdatedDate];
			this.itemForm = this.fb.group(temp);
			this.itemForm.disable();
			this.focusInput.nativeElement.focus();
		}

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

		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng bảo hiểm y tế`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): DoiTuongBHYTModel {
		const controls = this.itemForm.controls;
		const _item = new DoiTuongBHYTModel();
		_item.Id = this.item.Id;
		_item.DoiTuong = controls.DoiTuong.value;
		_item.MaDoiTuong = controls.MaDoiTuong.value;
		_item.MoTa = controls.MoTa.value;
		_item.Type = controls.Type.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
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
		if (controls.Priority.value < 0 || controls.Priority.value === '') {
			this.hasFormErrors = true;
			return;
		}
		const EditDoiTuongBHYT = this.prepareCustomer();
		if (EditDoiTuongBHYT.Id > 0) {
			this.UpdateDoiTuongBHYT(EditDoiTuongBHYT, withBack);
		} else {
			this.CreateDoiTuongBHYT(EditDoiTuongBHYT, withBack);
		}
	}

	UpdateDoiTuongBHYT(_item: DoiTuongBHYTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.UpdateDoiTuongBHYT(_item).subscribe(res => {
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

	CreateDoiTuongBHYT(_item: DoiTuongBHYTModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.CreateDoiTuongBHYT(_item).subscribe(res => {
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
