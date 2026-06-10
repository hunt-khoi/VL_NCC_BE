import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import moment from 'moment';

@Component({
	selector: 'kt-to-trinh-edit',
	templateUrl: './to-trinh-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ToTrinhEditComponent implements OnInit {
	data: any;
	item: any;
	itemForm: FormGroup = new FormGroup({});
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = true;
	callapi = true; //update trên form hay k
	listLoaiQuyetDinh: any[] = [];
	image: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	ngay1 = moment(new Date());
	ngay2 = moment(new Date());

	constructor(
		private fb: FormBuilder,
		private commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('Tờ trình');
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.callapi != undefined)
			this.callapi = this.data.callapi;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
		}
	}

	createForm() {
		const temp: any = {
			SoToTrinh: [this.item.SoTT, Validators.required],
			NgayRaToTrinh: [this.item.NgayRaTT, Validators.required],
		};
		this.itemForm = this.fb.group(temp);
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	prepare(): any {
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.SoToTrinh = controls.SoToTrinh.value;
		_item.NgayRaToTrinh = this.commonService.f_convertDate(controls.NgayRaToTrinh.value);
		return _item;
	}

	onSubmit() {
		this.loadingAfterSubmit = false;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}
		const Edit = this.prepare();
		return Edit;
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.itemForm.markAsPristine();
		this.itemForm.markAsUntouched();
		this.itemForm.updateValueAndValidity();
	}
}