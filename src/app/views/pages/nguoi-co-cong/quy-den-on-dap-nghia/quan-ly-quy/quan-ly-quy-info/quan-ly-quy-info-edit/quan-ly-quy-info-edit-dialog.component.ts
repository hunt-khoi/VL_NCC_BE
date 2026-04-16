import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from 'app/core/_base/crud';
import { QuyDenOnMoDel } from './../../Model/dong-gop-quy.model';
import { QuanLyQuyService } from '../../Services/quan-ly-quy.service';

@Component({
  selector: 'kt-quan-ly-quy-info-edit-dialog',
  templateUrl: './quan-ly-quy-info-edit-dialog.component.html',
})

export class QLQuyInfoEditDialogComponent implements OnInit {

 	item: QuyDenOnMoDel;
	oldItem: QuyDenOnMoDel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild("focusInput", { static: true }) focusInput: ElementRef;
	_name = "";

	/* Keyboard Shortcut Keys */
	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
	}

  	constructor(public dialogRef: MatDialogRef<QLQuyInfoEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
    	public objectService: QuanLyQuyService,
		private translate: TranslateService) {
			this._name = this.translate.instant("QUYINFO.NAME");
	}

  	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			QuyDenOn: [this.item.QuyDenOn, Validators.required],
			SoTaiKhoan: [this.item.SoTaiKhoan, Validators.required],
			TenNganHang: [this.item.TenNganHang, Validators.required],
			SoTienDau: [this.item.SoTienDau, Validators.required],
			TenTaiKhoan: [this.item.TenTaiKhoan],
			MaQHNganSach: [this.item.MaQHNganSach, Validators.maxLength(7)],
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
		if (this.allowEdit == false) {
			return 'Xem chi tiết quỹ';
		}

		result = this.translate.instant('COMMON.UPDATE') + ' quỹ';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): QuyDenOnMoDel {
		const controls = this.itemForm.controls;
		const _item = new QuyDenOnMoDel();
		_item.Id = this.item.Id;
		_item.QuyDenOn = controls['QuyDenOn'].value;
		_item.SoTaiKhoan = controls['SoTaiKhoan'].value;
		_item.SoTienDau = controls['SoTienDau'].value;
		_item.TenNganHang = controls['TenNganHang'].value;
		_item.TenTaiKhoan = controls['TenTaiKhoan'].value;
		_item.MaQHNganSach = controls['MaQHNganSach'].value;
		_item.IsAuto = false;
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

		const EditDVDongGop = this.prepareCustomer();
		if (EditDVDongGop.Id > 0) {
			this.UpdateDVDongGop(EditDVDongGop, withBack);
		} else {
			this.CreateDVDongGop(EditDVDongGop, withBack);
		}
	}
	
	UpdateDVDongGop(_item: QuyDenOnMoDel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateQuy(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({_item});
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

	CreateDVDongGop(_item: QuyDenOnMoDel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateQuy(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({_item});
          			this.ngOnInit();
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

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
