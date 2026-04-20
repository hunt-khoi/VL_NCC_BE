import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import moment from 'moment';

@Component({
	selector: 'kt-than-nhan-edit',
	templateUrl: './than-nhan-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThanNhanEditComponent implements OnInit {
	data: any;
	item: any;
	oldItem: any;
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	listquanhevoilietsy: any[] = [];
	listgioitinh: any[] = [];
	hideOther: boolean = false;

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();

	constructor(
		private fb: FormBuilder,
		private commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('THANNHAN.NAME');
	}

	ngOnInit() {
		this.loadListGioiTinh();
		this.loadListQuanHeVoiLietSy();
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.hideOther != undefined)
			this.hideOther = this.data.hideOther;

		this.createForm();
		if (this.item.Id > 0 && this.data.objectService) {
			this.viewLoading = true;
			this.data.objectService.getItem(this.item.Id).subscribe((res: any) => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					if (this.item.NgaySinh === null) {
						this.item.NgaySinh = '';
					}
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listquanhevoilietsy = res.data;
		});
	}

	createForm() {
		const temp: any = {
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			NguyenQuan: [this.item.NguyenQuan],
			SoHoSo: [this.item.SoHoSo],
			SDT: [this.item.SDT, [Validators.pattern(this.commonService.ValidateFormatRegex('phone')), Validators.maxLength(11)]],
			Email: [this.item.Email, [Validators.email]],
			NgaySinh: [this.item.NgaySinh],
			NamSinh: [this.item.NamSinh],
			GioiTinh: [this.item.GioiTinh],
			IsChet: [this.item.IsChet],
			NgayChet: [this.item.NgayChet],
			SoKhaiTu: [this.item.SoKhaiTu],
			NgayKhaiTu: [this.item.NgayKhaiTu],
			NoiKhaiTu: [this.item.NoiKhaiTu],
			Id_QHGiaDinh: [this.item.Id_QHGiaDinh, Validators.required],
			IsCanCu: [this.item.IsCanCu],
			SoBangTQCC:[this.item.SoBangTQCC],
			SoGCNTB: [this.item.SoGCNTB],
			TLThuongTat: [this.item.TLThuongTat],
		};
		this.itemForm = this.fb.group(temp);
		if (!this.hideOther && this.focusInput) 
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) 
			this.itemForm.disable();
	}

	changeNS(isNam = false) {
		if (!this.itemForm) return;
		if (isNam) {
			this.itemForm.controls.NgaySinh.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh.value;
			if (val != null) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh.setValue(y);
			}
		}
	}

	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		let _item: any = {};
		_item.Id = this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.SDT = controls.SDT.value;
		_item.Email = controls.Email.value;
		_item.NguyenQuan = controls.NguyenQuan.value;
		_item.GioiTinh = controls.GioiTinh.value;
		_item.Id_QHGiaDinh = controls.Id_QHGiaDinh.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.IsChet = controls.IsChet.value == true;
		if (_item.IsChet) {
			_item.NgayChet = this.commonService.f_convertDate(controls.NgayChet.value);
			_item.SoKhaiTu = controls.SoKhaiTu.value;
			_item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu.value);
			_item.NoiKhaiTu = controls.NoiKhaiTu.value;
		}
		_item.Id_NCC = this.data.id_ncc;
		if (controls.NgaySinh.value !== '') {
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		} else {
			_item.NgaySinh = '01/01/0001';
		}
		_item.NamSinh = +controls.NamSinh.value;
		_item.IsCanCu = controls.IsCanCu.value == true,
		_item.SoBangTQCC = controls.SoBangTQCC.value,
		_item.SoGCNTB = controls.SoGCNTB.value,
		_item.TLThuongTat = controls.TLThuongTat.value
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
		const EditThanNhan = this.prepareCustomer();
		return EditThanNhan;
	}
}