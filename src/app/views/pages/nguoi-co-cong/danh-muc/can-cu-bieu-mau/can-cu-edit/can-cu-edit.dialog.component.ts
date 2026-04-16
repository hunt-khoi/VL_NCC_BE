import { Component, OnInit, ElementRef, Inject, ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TypesUtilsService } from './../../../../../../core/_base/crud/utils/types-utils.service';
import { LayoutUtilsService } from './../../../../../../core/_base/crud/utils/layout-utils.service';
import { CommonService } from './../../../services/common.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CanCuService } from '../services/can-cu.service';

@Component({
	selector: 'kt-can-cu-edit',
	templateUrl: './can-cu-edit.dialog.component.html',
})
export class CanCuEditDialogComponent implements OnInit {
	item: any;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn: boolean = false;
	allowEdit: boolean = true;
	isZoomSize: boolean = false;
	listLoaiGiayTo: any;
	change: boolean = false;
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

	constructor(public dialogRef: MatDialogRef<CanCuEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private danhmuckhacService: CanCuService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CANCU.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (+this.item.Id > 0) {
			this.danhmuckhacService.getItem(this.item.Id).subscribe(res => {
				if (res && res.status == 1) {
					this.item = res.data;
					this.createForm();
				} else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			SoCanCu: [this.item.SoCanCu, Validators.required],
			CanCu: [this.item.CanCu, Validators.required],
			NguoiKy: [this.item.NguoiKy],
			TrichYeu: [this.item.TrichYeu],
			CoQuanBanHanh: [this.item.CoQuanBanHanh],
			PhanLoai: [this.item.PhanLoai],
			NgayBanHanh: [this.item.NgayBanHanh],
			HieuLuc_From: [this.item.HieuLuc_From],
			HieuLuc_To: [this.item.HieuLuc_To],
			Priority: [this.item.Priority, Validators.min(1)],
			FileDinhKem: [this.item.FileDinhKem ? [this.item.FileDinhKem] : null]
		});

		this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		if (this.item.Id > 0) {
			if (this.allowEdit)
				return 'Cập nhật căn cứ';
			else
				return 'Chi tiết căn cứ';
		}
		else
			return 'Thêm mới căn cứ';
	}

	/** ACTIONS */
	prepareCustomer(): any {
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.SoCanCu = controls['SoCanCu'].value;
		_item.CanCu = controls['CanCu'].value;
		_item.NguoiKy = controls['NguoiKy'].value;
		_item.CoQuanBanHanh = controls['CoQuanBanHanh'].value;
		_item.TrichYeu = controls['TrichYeu'].value;
		_item.PhanLoai = controls['PhanLoai'].value;
		_item.NgayBanHanh = this.commonService.f_convertDate(controls['NgayBanHanh'].value);
		_item.HieuLuc_From = this.commonService.f_convertDate(controls['HieuLuc_From'].value);
		_item.HieuLuc_To = this.commonService.f_convertDate(controls['HieuLuc_To'].value);
		_item.Priority = controls['Priority'].value;
		let temp = controls['FileDinhKem'].value;
		if (temp) {
			temp = temp.filter(x => !x.IsDel);
			if (temp && temp.length > 0)
				_item.FileDinhKem = temp[0];
			else
				_item.FileDinhKem = null;
		}
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
			this.UpdateDanhmuc(EditDanhmucKhac);
		} else {
			this.CreateDanhmuc(EditDanhmucKhac, withBack);
		}
	}
	UpdateDanhmuc(_item: any) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.danhmuckhacService.UpdateItem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.dialogRef.close({
					_item
				});
			}
			else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	CreateDanhmuc(_item: any, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.disabledBtn = true;
		this.danhmuckhacService.CreateItem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.change = true;
					this.reset();
				}
			}
			else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
	reset() {
		this.item = { Id: 0 };
		this.createForm();
	}
	onAlertClose($event) {
		this.hasFormErrors = false;
	}
	close() {
		this.dialogRef.close(this.change);
	}
}
