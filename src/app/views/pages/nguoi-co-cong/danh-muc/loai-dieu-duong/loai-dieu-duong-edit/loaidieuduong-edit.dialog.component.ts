import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { loaiDieuDuongModel } from '../Model/loaidieuduong.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { loaiDieuDuongServices } from '../Services/loaidieuduong.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-loai-dieu-duong-edit',
	templateUrl: './loaidieuduong-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoaiDieuDuongEditDialogComponent implements OnInit {
	item: loaiDieuDuongModel;
	oldItem: loaiDieuDuongModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
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

	constructor(public dialogRef: MatDialogRef<LoaiDieuDuongEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private loaiDieuDuongServices: loaiDieuDuongServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("LOAI_DD.NAME");
	}
	
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.loaiDieuDuongServices.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					this.allowEdit = res.data.AllowEdit;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			LoaiDieuDuong: ['' + this.item.LoaiDieuDuong, Validators.required],
			MoTa: ['' + this.item.MoTa],
			Priority: [this.item.Priority, Validators.pattern(this.danhMucService.ValidateFormatRegex('prior'))],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (!this.allowEdit) {
			return 'Xem chi tiết loại điều dưỡng';
		}

		result = this.translate.instant('COMMON.UPDATE') + ' loại điều dưỡng';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): loaiDieuDuongModel {
		const controls = this.itemForm.controls;
		const _item = new loaiDieuDuongModel();
		_item.Id = this.item.Id;
		_item.LoaiDieuDuong = controls['LoaiDieuDuong'].value; // lấy tên biến trong formControlName
		_item.MoTa = controls['MoTa'].value;
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
		const EditLoaiDieuDuong = this.prepareCustomer();
		if (EditLoaiDieuDuong.Id > 0) {
			this.UpdateLoaiDieuDuong(EditLoaiDieuDuong, withBack);
		} else {
			this.CreateLoaiDieuDuong(EditLoaiDieuDuong, withBack);
		}
	}

	UpdateLoaiDieuDuong(_item: loaiDieuDuongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiDieuDuongServices.UpdateLoaiDieuDuong(_item).subscribe(res => {
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
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}

	CreateLoaiDieuDuong(_item: loaiDieuDuongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		//	this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiDieuDuongServices.CreateLoaiDieuDuong(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				}
				else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._name });
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
