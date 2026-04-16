import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import moment from 'moment';
import { Moment } from 'moment';

@Component({
	selector: 'kt-qua-trinh-hoat-dong-edit',
	templateUrl: './qua-trinh-hoat-dong-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class QuaTrinhHoatDongEditComponent implements OnInit {
	data: any;
	item: any;
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;
	hideOther = false; //ẩn  Cấp bậc, chức vụ, đơn vị, địa bàn, tình trạng chết
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	maxNS: Moment | undefined;
	ngay1: Moment | undefined;
	ngay2: Moment | undefined;
	default: number = 0;

	constructor(
		private fb: FormBuilder,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
	}

	/** LOAD DATA */
	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		if (this.data.hideOther != undefined)
			this.hideOther = this.data.hideOther;
		if (this.hideOther)
			this.default = 3; //chết
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.data.objectService.getItem(this.item.Id).subscribe((res: any) => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.ngay1 = moment(this.item.TuNgay);
					this.ngay2 = this.item.DenNgay != null ? moment(this.item.DenNgay) : undefined;
					if (this.item.IsNghiHuu == true)
						this.default = 1
					else
						this.default = 2
					if (this.item.IsChet == true)
						this.default = 3
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	createForm() {
		const temp: any = {
			CapBac: [this.item.CapBac],
			ChucVu: [this.item.ChucVu],
			DonVi: [this.item.DonVi],
			DiaBan: [this.item.DiaBan],
			TuNgay: [this.item.TuNgay, Validators.required],
			DenNgay: [this.item.DenNgay],
			TinhTrang: [this.default]
		};

		this.itemForm = this.fb.group(temp);

		// this.focusInput.nativeElement.focus();
		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();

	}
	/** ACTIONS */
	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.Id_NCC = this.item.Id_NCC;
		_item.CapBac = controls.CapBac.value != null ? controls.CapBac.value : "";
		_item.ChucVu = controls.ChucVu.value != null ? controls.ChucVu.value : "";
		_item.DonVi = controls.DonVi.value != null ? controls.DonVi.value : "";
		_item.DiaBan = controls.DiaBan.value != null ? controls.DiaBan.value : "";

		if (controls.TuNgay.value)
			_item.TuNgay = this.commonService.f_convertDate(controls.TuNgay.value); //ko bị trừ ngày khi save db
		if (controls.DenNgay.value)
			_item.DenNgay = this.commonService.f_convertDate(controls.DenNgay.value);
		else
			_item.DenNgay = null;


		if (controls.TinhTrang.value) {
			var temp = controls.TinhTrang.value;
			if (temp == 1) {
				_item.IsNghiHuu = true
				_item.IsChet = false
			}
			if (temp == 2) {
				_item.IsNghiHuu = false
				_item.IsChet = false
			}
			if (temp == 3) {
				_item.IsNghiHuu = false
				_item.IsChet = true
			}
		}
		else {
			_item.IsNghiHuu = false
			_item.IsChet = false
		}

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
		const EditTroCap = this.prepareCustomer();
		return EditTroCap;
	}
}