// Angular
import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// Service
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { HoSoNhaOService } from './../Services/ho-so-nha-o.service';
import { HoSoNhaOModel } from '../../ho-so-nha-o/Model/ho-so-nha-o.model';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';

@Component({
	selector: 'kt-ho-so-nha-o-edit',
	templateUrl: './ho-so-nha-o-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNhaOEditDialogComponent implements OnInit {
	objectId: string;
	item: HoSoNhaOModel;
	oldItem: HoSoNhaOModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	filterprovinces: number;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];
	list_doituong: any[] = [];
	listKhomAp: any[] = [];

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	Capcocau: number = 0

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

	constructor(public dialogRef: MatDialogRef<HoSoNhaOEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private actRoute: ActivatedRoute,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: HoSoNhaOService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = 'Hồ sơ hỗ trợ nhà ở';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.getlistDoiTuong();
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
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

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
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
			SoHoSo: [this.item.SoHoSo],
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			NgaySinh: [this.item.NgaySinh],
			NamSinh: [this.item.NamSinh],
			Province: [this.item.ProvinceID, Validators.required],
			District: [this.item.DistrictID, Validators.required],
			Id_Xa: [this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp, Validators.required],
			ChiPhi: [this.item.ChiPhiYeuCau, Validators.required],
			Id_HinhThuc: [this.item.Id_HinhThuc, Validators.required],
			GioiTinh:  ['' + this.item.GioiTinh, Validators.required],
			NoiDung: [this.item.NoiDungHoTro],
			Id_DoiTuong: ['' + this.item.Id_DoiTuong, Validators.required],
			GhiChu: [this.item.GhiChu],
			FileDinhKem: [this.item.HinhAnhs],
		};

		this.itemForm = this.fb.group(temp);
		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		this.changeDetectorRefs.detectChanges();
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

		result = this.translate.instant('COMMON.UPDATE') + ` hồ sơ hỗ trợ nhà ở`;
		return result;
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
			this.list_doituong = res.data;
			this.filteredListOptDT.next(this.list_doituong);
			this.changeDetectorRefs.detectChanges();
		});
	}
	filterDoiTuong() {
		if (!this.list_doituong) {
			return;
		}
		let search = this.FilterCtrlDT;
		if (!search) {
			this.filteredListOptDT.next(this.list_doituong.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.filteredListOptDT.next(
			this.list_doituong.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	/** ACTIONS */
	prepareCustomer(): HoSoNhaOModel {
		const controls = this.itemForm.controls;
		const _item = new HoSoNhaOModel();
		_item.Id = +this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_HinhThuc = +controls.Id_HinhThuc.value;
		_item.ChiPhiYeuCau = +controls.ChiPhi.value;
		_item.NoiDungHoTro = controls.NoiDung.value;
		_item.GhiChu = controls.GhiChu.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.Id_DoiTuong = controls.Id_DoiTuong.value;

		let file = controls.FileDinhKem.value;
		if (file && file.length > 0)
			_item.HinhAnhs = file;
		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		_item.NamSinh = +controls.NamSinh.value;
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
		let EditHoSoNCC: any = this.prepareCustomer();
		if (EditHoSoNCC == null)	return;
		if (EditHoSoNCC.Id > 0) {
			this.UpdateHoSoNCC(EditHoSoNCC, withBack);
		} else {
			this.CreateHoSoNCC(EditHoSoNCC, withBack);
		}
	}
	UpdateHoSoNCC(_item: HoSoNhaOModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateHoSoNCC(_item).subscribe(res => {
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
	CreateHoSoNCC(_item: HoSoNhaOModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateHoSoNCC(_item).subscribe(res => {
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

	resizeDialog() {
		if (!this.isZoomSize) {
			this.dialogRef.updateSize('90%', 'auto');
			this.isZoomSize = true;
		}
		else if (this.isZoomSize) {
			this.dialogRef.updateSize('70%', 'auto');
			this.isZoomSize = false;
		}
	}

	downAllFiles() {
		this.objectService.downAllFiles(this.item.Id).subscribe(response => {
			const headers = response.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([response.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
		}, err => {
			this.layoutUtilsService.showError("Tải xuống các file không thành công");
		});
	}
}
