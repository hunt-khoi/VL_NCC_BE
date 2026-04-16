import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { CommonService } from '../../../services/common.service';
import { dtHoTroModel } from '../Model/dt-ho-tro-quy.model';
import { dtHoTroServices } from '../Services/dt-ho-tro-quy.service';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-dt-ho-tro-quy-edit',
	templateUrl: './dt-ho-tro-quy-edit.dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class DTHoTroEditDialogComponent implements OnInit {

	item: dtHoTroModel;
	oldItem: dtHoTroModel;
	itemForm: FormGroup;
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	isZoomSize: boolean = false;
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	listDTHT:any[] = [];
	listNDHT:any[] = [];
	listKhomAp: any[] = [];
	listgioitinh: any[] = [];
	filterward = '';

	Capcocau: number;
	maxNS = moment(new Date()).add(-16, 'year').toDate();
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

	constructor(public dialogRef: MatDialogRef<DTHoTroEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private dtHoTroServices: dtHoTroServices,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		public commonService: CommonService,
		private translate: TranslateService) {
			this._name = this.translate.instant("DT_HOTRO.NAME");
	}

	ngOnInit() {
		this.item = this.data._item;
		//if (this.data.allowEdit != undefined)
		this.allowEdit = this.data.allowEdit;
		
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			// this.filterdistrict = res.ID_Goc_Cha;
			// this.item.DistrictID = +this.filterdistrict;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;

			if (res.Capcocau == 2) { //cấp huyện
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
			if (res.Capcocau == 3) { //cấp xã
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
					this.loadKhomAp();
				}
			}
		})
		this.getlistDoiTuong();
		this.loadListGioiTInh();
		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.dtHoTroServices.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.loadGetListWardByDistrict(this.item.DistrictID);
					this.filterward = '' + this.item.Id_Xa;
					this.loadKhomAp();
					this.createForm();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	createForm() {
		const temp: any = {
			SoHoSo: [this.item.SoHoSo, Validators.required],
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			GhiChu: [this.item.GhiChu],
			NgaySinh: [this.item.NgaySinh],
			GioiTinh: ['' + this.item.GioiTinh, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			District: ['' + this.item.DistrictID, Validators.required],
			Id_Xa: ['' + this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp ? '' + this.item.Id_KhomAp : null, Validators.required],
			NamSinh: [this.item.NamSinh, Validators.required],
			Id_DoiTuong: ['' + this.item.Id_DoiTuong, Validators.required],
			SoTienYC: [this.item.ChiPhiYeuCau, Validators.required]
		};

		this.itemForm = this.fb.group(temp);
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();
	}
	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadGetListWardByDistrict(idDistrict: any) {
		this.commonService.GetListWardByDistrict(idDistrict).subscribe(res => {
			this.listward = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadKhomAp() {
		this.commonService.GetListKhomApByWard(this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	
	loadListGioiTInh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE') + ' ';
		if (!this.item || !this.item.Id) {
			return result;
		}
		if (this.allowEdit == false) {
			return 'Xem chi tiết ';
		}

		result = this.translate.instant('COMMON.UPDATE') + ' ';
		return result + this.translate.instant("DT_HOTRO.NAME");
	}

	changeNS(isNam = false) {
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

	FilterCtrlDT: string = '';
	filteredListOptDT: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	getlistDoiTuong() {
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			this.listDTHT = res.data;
			this.filteredListOptDT.next(this.listDTHT);
			this.changeDetectorRefs.detectChanges();
		});
	}
	filterDoiTuong() {
		if (!this.listDTHT) {
			return;
		}
		let search = this.FilterCtrlDT;
		if (!search) {
			this.filteredListOptDT.next(this.listDTHT.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.filteredListOptDT.next(
			this.listDTHT.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareCustomer(): dtHoTroModel {
		const controls = this.itemForm.controls;
		const _item = new dtHoTroModel();
		_item.Id = +this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.NamSinh = +controls.NamSinh.value;
		_item.GhiChu = controls.GhiChu.value;
		_item.Id_DoiTuong = +controls.Id_DoiTuong.value;
		_item.ChiPhiYeuCau = +controls.SoTienYC.value;

		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);

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
	

		const EditDTHoTro = this.prepareCustomer();
		if (EditDTHoTro.Id > 0) {
			this.UpdateDTHoTro(EditDTHoTro, withBack);
		} else {
			this.CreateDTHoTro(EditDTHoTro, withBack);
		}
	}
	UpdateDTHoTro(_item: dtHoTroModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dtHoTroServices.UpdateDTHoTro(_item).subscribe(res => {
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
	CreateDTHoTro(_item: dtHoTroModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.dtHoTroServices.CreateDTHoTro(_item).subscribe(res => {
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
