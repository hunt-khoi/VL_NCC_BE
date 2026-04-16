import { NguonKinhPhiService } from '../Services/nguon-kinh-phi.service';
import { NguonKinhPhiModel } from '../Model/nguon-kinh-phi.model';
import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';

@Component({
	selector: 'kt-nguon-kinh-phi-edit',
	templateUrl: './nguon-kinh-phi-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NguonKinhPhiEditDialogComponent implements OnInit {
	item: NguonKinhPhiModel;
	oldItem: NguonKinhPhiModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';

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
		public dialogRef: MatDialogRef<NguonKinhPhiEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private danhMucService: CommonService,
		private objectService: NguonKinhPhiService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private translate: TranslateService) {
			this._NAME = this.translate.instant('NGUONKINHPHI.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
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
			NguonKinhPhi: ['' + this.item.NguonKinhPhi, Validators.required],
			Priority: [this.item.Priority > -1 ? this.item.Priority : 0],
		};

		if (this.allowEdit) {
			this.itemForm = this.fb.group(temp);

			this.focusInput.nativeElement.focus();
		} else {

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

		result = this.translate.instant('COMMON.UPDATE') + ` nguồn kinh phí`;
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): NguonKinhPhiModel {
		const controls = this.itemForm.controls;
		const _item = new NguonKinhPhiModel();
		_item.Id = this.item.Id;
		_item.NguonKinhPhi = controls.NguonKinhPhi.value;
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
		const EditNguonKinhPhi = this.prepareCustomer();
		if (EditNguonKinhPhi.Id > 0) {
			this.UpdateNguonKinhPhi(EditNguonKinhPhi, withBack);
		} else {
			this.CreateNguonKinhPhi(EditNguonKinhPhi, withBack);
		}
	}

	UpdateNguonKinhPhi(_item: NguonKinhPhiModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateNguonKinhPhi(_item).subscribe(res => {
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

	CreateNguonKinhPhi(_item: NguonKinhPhiModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateNguonKinhPhi(_item).subscribe(res => {
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
