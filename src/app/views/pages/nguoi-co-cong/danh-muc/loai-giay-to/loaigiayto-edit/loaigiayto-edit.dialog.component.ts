import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { loaiGiayToModel } from '../Model/loaigiayto.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { loaiGiayToServices } from '../Services/loaigiayto.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-loai-giay-to-edit',
	templateUrl: './loaigiayto-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class LoaiGiayToEditDialogComponent implements OnInit {
	item: loaiGiayToModel;
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

	constructor(public dialogRef: MatDialogRef<LoaiGiayToEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private loaiGiayToServices: loaiGiayToServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("LOAI_GT.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		//if (this.data.allowEdit != undefined)
		this.allowEdit = this.data.allowEdit;
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.loaiGiayToServices.getItem(this.item.Id).subscribe(res => {
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
			LoaiGiayTo: [this.item.LoaiGiayTo, Validators.required],
			MoTa: [this.item.MoTa],
			Priority: [this.item.Priority],
			Keys_ID: [this.item.Keys_ID]
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
			return 'Xem chi tiết loại giấy tờ';
		}

		result = this.translate.instant('COMMON.UPDATE') + ' loại giấy tờ';
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): loaiGiayToModel {
		const controls = this.itemForm.controls;
		const _item = new loaiGiayToModel();
		_item.Id = this.item.Id;
		_item.LoaiGiayTo = controls['LoaiGiayTo'].value; 
		_item.MoTa = controls['MoTa'].value;
		_item.Priority = controls['Priority'].value;
		_item.Keys_ID = controls['Keys_ID'].value;
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

		const EditLoaiGiayTo = this.prepareCustomer();
		if (EditLoaiGiayTo.Id > 0) {
			this.UpdateLoaiGiayTo(EditLoaiGiayTo, withBack);
		} else {
			this.CreateLoaiGiayTo(EditLoaiGiayTo, withBack);
		}
	}

	UpdateLoaiGiayTo(_item: loaiGiayToModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiGiayToServices.UpdateLoaiGiayTo(_item).subscribe(res => {
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

	CreateLoaiGiayTo(_item: loaiGiayToModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.loaiGiayToServices.CreateLoaiGiayTo(_item).subscribe(res => {
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

	onAlertClose($event) {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close();
	}
}
