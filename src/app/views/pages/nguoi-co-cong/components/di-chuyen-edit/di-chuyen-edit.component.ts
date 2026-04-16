import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../services/common.service';
import { LayoutUtilsService } from '../../../../../core/_base/crud';
import moment from 'moment';
import { Moment } from 'moment';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-di-chuyen-edit',
	templateUrl: './di-chuyen-edit.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DiChuyenEditComponent implements OnInit {
	data: any;
	item: any;
	ncc: any = {};
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	hideOther = false;//hide from
	allowEdit = false;
	isChuyenDi: boolean = true;
	listTinh: any[] = [];
	listHuyen: any[] = [];
	listHuyenOld: any[] = [];
	listXa: any[] = [];
	listXaOld: any[] = [];
	listKhomAp: any[] = [];
	listKhomApOld: any[] = [];
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	maxNS: Moment | undefined;
	filterprovinces: number = 0;

	constructor(
		private fb: FormBuilder,
		public commonService: CommonService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DICHUYEN.NAME');
	}

	/** LOAD DATA */
	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		// if (this.data.hideOther != undefined)
		// 	this.hideOther = this.data.hideOther;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listTinh = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
		})

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.data.objectService.getItem(this.item.Id).subscribe((res: any) => {
				this.viewLoading = false;
				if (res && res.status === 1) {
					this.item = res.data;
					this.isChuyenDi = res.data.IsChuyenDi;
					this.ncc = {
						ProvinceID: res.data.Id_Tinh_Old,
						DistrictID: res.data.Id_Huyen_Old,
						Id_Xa: res.data.Id_Xa_Old,
						Id_KhomAp: res.data.Id_KhomAp_Old,
						DiaChi: res.data.DiaChi_Old,
					};
					this.load_old();
					this.changeTinh(this.item.Id_Tinh);
					this.changeHuyen(this.item.Id_Huyen);
					if (this.item.Id_KhomAp)
						this.changeXa(this.item.Id_Xa);
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		} else {
			this.ncc = this.data.ncc;
			this.load_old();
			this.createForm();
		}
	}

	load_old() {
		this.commonService.GetListDistrictByProvinces(this.ncc.ProvinceID).subscribe(res => {
			this.listHuyenOld = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.commonService.GetListWardByDistrict(this.ncc.DistrictID).subscribe(res => {
			this.listXaOld = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		if (this.ncc.Id_KhomAp) {
			this.commonService.GetListKhomApByWard(this.ncc.Id_Xa).subscribe(res => {
				this.listKhomApOld = res.data;
				this.changeDetectorRefs.detectChanges();
			});
		}
	}

	createForm() {
		const temp: any = {
			tinh_old: [this.ncc.ProvinceID],
			huyen_old: [this.ncc.DistrictID],
			xa_old: [this.ncc.Id_Xa],
			khomap_old: [this.ncc.Id_KhomAp],
			diaChi_old: [this.ncc.DiaChi],
			tinh: [this.item.Id_Tinh, Validators.required],
			huyen: [this.item.Id_Huyen, Validators.required],
			xa: [this.item.Id_Xa, Validators.required],
			khomap: [this.item.Id_KhomAp],
			diaChi: [this.item.DiaChi],
			DaGiaiQuyet: [this.item.DaGiaiQuyet],
			ChuaGiaiQuyet: [this.item.ChuaGiaiQuyet],
			ThucHien: [this.item.ThucHien],
			GiayTo: [this.item.GiayTo],
			GhiChu: [this.item.GhiChu],
			IsBanChinh: [this.item.IsBanChinh == null ? 1 : this.item.IsBanChinh],
			NgayChuyen: [this.item.NgayChuyen, Validators.required],
		};

		this.itemForm = this.fb.group(temp);
		this.itemForm.controls.tinh.disable();
		// if (!this.hideOther)
		// 	this.focusInput.nativeElement.focus();

		if (!this.allowEdit) 
			this.itemForm.disable();
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
		result = this.translate.instant('COMMON.UPDATE');
		return result;
	}

	/** ACTIONS */
	prepareCustomer(): any {
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		const _item: any = {};
		_item.Id = this.item.Id;
		_item.Id_NCC = this.item.Id_NCC;
		_item.Id_Tinh = controls.tinh.value;
		_item.Id_Huyen = controls.huyen.value;
		_item.Id_Xa = controls.xa.value;
		if (controls.khomap.value)
		_item.Id_KhomAp = controls.khomap.value
		_item.DiaChi = controls.diaChi.value;
		_item.Id_Xa_Old = controls.xa_old.value;
		_item.DiaChi_Old = controls.diaChi_old.value;
		if (controls.khomap_old.value)
			_item.Id_KhomAp_Old = controls.khomap_old.value
		_item.DaGiaiQuyet = controls.DaGiaiQuyet.value;
		_item.ChuaGiaiQuyet = controls.ChuaGiaiQuyet.value;
		_item.NgayChuyen = controls.NgayChuyen.value;
		_item.ThucHien = controls.ThucHien.value;
		_item.GiayTo = controls.GiayTo.value;
		_item.GhiChu = controls.GhiChu.value;
		_item.IsBanChinh = controls.IsBanChinh.value==1;
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		if (!this.itemForm) return;
		const controls = this.itemForm.controls;
		if (this.itemForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			this.hasFormErrors = true;
			return;
		}
		if (controls.xa_old.value == controls.xa.value) {
			this.layoutUtilsService.showInfo("Địa chỉ chuyển đến không được trùng với địa chỉ hiện tại");
			this.hasFormErrors = true;
			return;
		}
		const EditTroCap = this.prepareCustomer();
		EditTroCap.isChuyenDi = this.isChuyenDi;
		return EditTroCap;
	}

	changeTinh(val: number) {
		this.commonService.GetListDistrictByProvinces(val).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeHuyen(val: number) {
		this.commonService.GetListWardByDistrict(val).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeXa(val: number) {
		this.commonService.GetListKhomApByWard(val).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeTinhOld(val: number) {
		this.commonService.GetListDistrictByProvinces(val).subscribe(res => {
			this.listHuyenOld = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeHuyenOld(val: number) {
		this.commonService.GetListWardByDistrict(val).subscribe(res => {
			this.listXaOld = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeXaOld(val: number) {
		this.commonService.GetListKhomApByWard(val).subscribe(res => {
			this.listKhomApOld = res.data;
			this.changeDetectorRefs.detectChanges();
		});
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