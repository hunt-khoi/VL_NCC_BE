import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { dvDongGopModel } from '../Model/dv-dong-gop.model';
import { dvDongGopServices } from '../Services/dv-dong-gop.service';

@Component({
	selector: 'kt-dv-dong-gop-edit',
	templateUrl: './dv-dong-gop-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DVDongGopEditDialogComponent implements OnInit {

	item: dvDongGopModel;
	oldItem: dvDongGopModel;
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
		// lưu đóng
		if (event.altKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(true);
		}
		//lưu tiếp tục
		if (event.ctrlKey && event.keyCode == 13) { //phím Enter
			this.onSubmit(false);
		}
	}

	constructor(public dialogRef: MatDialogRef<DVDongGopEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private dvDongGopServices: dvDongGopServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("DV_DONGGOP.NAME");
	}
	ngOnInit() {
		
		this.item = this.data._item;
		//if (this.data.allowEdit != undefined)
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.dvDongGopServices.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status == 1) {
					this.item = res.data;
					//this.allowEdit = res.data.AllowEdit;
					this.createForm();
				}
				else
					this.layoutUtilsService.showError(res.error.message);
			})
		}
	}

	createForm() {
		this.itemForm = this.fb.group({
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			GhiChu: [this.item.GhiChu],
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
			return 'Xem chi tiết đơn vị đóng góp';
		}

		result = this.translate.instant('COMMON.UPDATE') + ' đơn vị đóng góp';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): dvDongGopModel {

		const controls = this.itemForm.controls;
		const _item = new dvDongGopModel();
		_item.Id = this.item.Id;
		_item.HoTen = controls['HoTen'].value;
		_item.GhiChu = controls['GhiChu'].value;
		_item.DiaChi = controls['DiaChi'].value;
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
	UpdateDVDongGop(_item: dvDongGopModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dvDongGopServices.UpdateDVDongGop(_item).subscribe(res => {
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
	CreateDVDongGop(_item: dvDongGopModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dvDongGopServices.CreateDVDongGop(_item).subscribe(res => {
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
