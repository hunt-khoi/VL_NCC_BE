import { TranslateService } from '@ngx-translate/core';
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { LoaiQuyetDinhService } from './../services/loai-quyet-dinh.service';
import { CommonService } from './../../../services/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';

@Component({
	selector: 'kt-loai-quyet-dinh-detail',
	templateUrl: './loai-quyet-dinh-detail.component.html',
})

export class LoaiQuyetDinhDetailComponent implements OnInit {
	item: any;
	oldItem: any;
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
	
	constructor(public dialogRef: MatDialogRef<LoaiQuyetDinhDetailComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private loaiQuyetDinhService: LoaiQuyetDinhService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._name = this.translate.instant("NHOM_QD.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (+this.item.Id > 0) {
			this.loaiQuyetDinhService.getItem(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
		this.createForm();
	}

	createForm() {
		this.itemForm = this.fb.group({
			LoaiQuyetDinh: ['' + this.item.LoaiQuyetDinh, Validators.required],
			MoTa: [this.item.MoTa],
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
	}

	getTitle(): string {
		if (this.item.Id > 0)
			return (this.allowEdit ? 'Cập nhật ' : 'Chi tiết ')+this._name;
		else
			return 'Thêm mới '+this._name;
	}
	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = this.item.Id;
		_item.LoaiQuyetDinh = controls['LoaiQuyetDinh'].value; // lấy tên biến trong formControlName
		_item.MoTa = controls['MoTa'].value;
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
		const EditDanhmucKhac = this.prepareCustomer();

		if (EditDanhmucKhac.Id > 0) {
			this.UpdateDanhmuc(EditDanhmucKhac, withBack);
		} else {
			this.CreateDanhmuc(EditDanhmucKhac, withBack);
		}
	}
	UpdateDanhmuc(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiQuyetDinhService.UpdateItem(_item).subscribe(res => {
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
	CreateDanhmuc(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.loaiQuyetDinhService.CreateItem(_item).subscribe(res => {
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
