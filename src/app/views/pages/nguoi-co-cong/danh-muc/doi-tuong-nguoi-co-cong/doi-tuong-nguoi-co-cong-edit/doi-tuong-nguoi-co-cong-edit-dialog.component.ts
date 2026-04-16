import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { DoiTuongNguoiCoCongService } from './../Services/doi-tuong-nguoi-co-cong.service';
import { DoiTuongNguoiCoCongModel } from './../Model/doi-tuong-nguoi-co-cong.model';

@Component({
	selector: 'kt-doi-tuong-nguoi-co-cong',
	templateUrl: './doi-tuong-nguoi-co-cong-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNguoiCoCongEditDialogComponent implements OnInit {
	item: DoiTuongNguoiCoCongModel;
	oldItem: DoiTuongNguoiCoCongModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	lstNhomLoaiDoiTuongNCC: any[] = [];
	lstConstLoaiHoSo: any[] = [];
	listLoaiQD: any[] = [];

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
		public dialogRef: MatDialogRef<DoiTuongNguoiCoCongEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private doiTuongNguoiCoCongService: DoiTuongNguoiCoCongService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONG_NCC.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		//list biểu mẫu
		this.danhMucService.liteConstLoaiQuyetDinh().subscribe(res => {
			this.listLoaiQD = res.data;
		});
		this.danhMucService.liteNhomLoaiDoiTuongNCC().subscribe(res => {
			if (res && res.status == 1)
				this.lstNhomLoaiDoiTuongNCC = res.data;
		})
		this.danhMucService.liteConstLoaiHoSo().subscribe(res => {
			if (res && res.status == 1)
				this.lstConstLoaiHoSo = res.data;
		})
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.doiTuongNguoiCoCongService.getItem(this.item.Id).subscribe(res => {
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
			DoiTuong: ['' + this.item.DoiTuong, Validators.required],
			MaDoiTuong: ['' + this.item.MaDoiTuong, Validators.required],
			Id_LoaiQuyetDinh: [this.item.Id_LoaiQuyetDinh, Validators.required],
			MoTa: ['' + this.item.MoTa],
			Priority: [this.item.Priority],
			Loai: [this.item.Loai],
			NhomLoaiDoiTuongNCC: ['' + this.item.NhomLoaiDoiTuongNCC],
			IsThanNhan: [this.item.IsThanNhan],
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);
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

		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng người có công`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): DoiTuongNguoiCoCongModel {
		const controls = this.itemForm.controls;
		const _item = new DoiTuongNguoiCoCongModel();
		_item.Id = this.item.Id;
		_item.DoiTuong = controls.DoiTuong.value;
		_item.MaDoiTuong = controls.MaDoiTuong.value;
		_item.Id_LoaiQuyetDinh = controls.Id_LoaiQuyetDinh.value;
		_item.MoTa = controls.MoTa.value;
		_item.Priority = controls.Priority.value > -1 ? controls.Priority.value : 1;
		_item.Loai = controls.Loai.value;
		_item.NhomLoaiDoiTuongNCC = controls.NhomLoaiDoiTuongNCC.value;
		_item.IsThanNhan = controls.IsThanNhan.value;
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
		const EditDoiTuongNguoiCoCong = this.prepareCustomer();
		if (EditDoiTuongNguoiCoCong.Id > 0) {
			this.UpdateDoiTuongNguoiCoCong(EditDoiTuongNguoiCoCong, withBack);
		} else {
			this.CreateDoiTuongNguoiCoCong(EditDoiTuongNguoiCoCong, withBack);
		}
	}

	UpdateDoiTuongNguoiCoCong(_item: DoiTuongNguoiCoCongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.UpdateDoiTuongNguoiCoCong(_item).subscribe(res => {
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

	CreateDoiTuongNguoiCoCong(_item: DoiTuongNguoiCoCongModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.doiTuongNguoiCoCongService.CreateDoiTuongNguoiCoCong(_item).subscribe(res => {
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
