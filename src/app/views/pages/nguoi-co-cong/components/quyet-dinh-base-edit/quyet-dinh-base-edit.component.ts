import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { Moment } from 'moment';

@Component({
	selector: 'kt-quyet-dinh-base-edit',
	templateUrl: './quyet-dinh-base-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuyetDinhBaseEditComponent implements OnInit {
	data: any;
	item: any;
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = true;
	callapi = true; //update trên form hay k
	listLoaiQuyetDinh: any[] = [];
	image: any;
	ngay1: Moment | undefined;
	ngay2: Moment | undefined;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';

	constructor(
		private fb: FormBuilder,
		private commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('QUYETDINH.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.callapi != undefined)
			this.callapi = this.data.callapi;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			// this.data.objectService.getItem(this.item.Id).subscribe(res => {
			// 	this.viewLoading = false;
			// 	this.changeDetectorRefs.detectChanges();
			// 	if (res && res.status === 1) {
			// 		this.item = res.data;
			// 		this.ngay1 = moment(this.item.NgayRaQD);
			// 		this.ngay2 = moment(this.item.NgayHieuLuc);
			// 		this.createForm();
			// 	} else {
			// 		this.layoutUtilsService.showError(res.error.message);
			// 	}
			// });
		}
	}

	createForm() {
		const temp: any = {
			SoQuyetDinh: [this.item.SoQD, Validators.required],
			NgayRaQuyetDinh: [this.item.NgayRaQD, Validators.required],
			NgayHieuLuc: [this.item.NgayHieuLuc, Validators.required],
		};
		this.itemForm = this.fb.group(temp);
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) 
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.SoQuyetDinh = controls.SoQuyetDinh.value;
		_item.NgayRaQuyetDinh = this.commonService.f_convertDate(controls.NgayRaQuyetDinh.value);
		_item.NgayHieuLuc = this.commonService.f_convertDate(controls.NgayHieuLuc.value);
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		/* check form */
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);

			this.hasFormErrors = true;
			return;
		}
		const EditQuyetDinh = this.prepareCustomer();
		return EditQuyetDinh;
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
}