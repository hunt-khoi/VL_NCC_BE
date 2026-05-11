import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { DoiTuongNhanQuaService } from './../Services/doi-tuong-nhan-qua.service';
import { DoiTuongNhanQuaModel } from '../../doi-tuong-nhan-qua/Model/doi-tuong-nhan-qua.model';
import moment from 'moment';

@Component({
	selector: 'kt-doi-tuong-nhan-qua-edit',
	templateUrl: './doi-tuong-nhan-qua-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongNhanQuaEditDialogComponent implements OnInit {

	item: DoiTuongNhanQuaModel = new DoiTuongNhanQuaModel();
	oldItem: DoiTuongNhanQuaModel = new DoiTuongNhanQuaModel();
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listquanhevoilietsy: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl2: string = '';
	listwardOpt: any[] = [];
	listwardFiltered: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listKhomAp: any[] = [];
	thannhanName = '';
	quanhe: number | null = 0;
	require = '';
	objectThanNhan: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	Id_LoaiHoSo: number = 0;
	IsThanNhan: boolean = false;
	Capcocau: number = 0;
	change: boolean = false;
	IsReturn: boolean = false;

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
		public dialogRef: MatDialogRef<DoiTuongNhanQuaEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: DoiTuongNhanQuaService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONGNHANQUA.NAME');
	}

	ngOnInit() {
		this.item = this.data._item;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		if (this.data.IsReturn != undefined)
			this.IsReturn = this.data.IsReturn;

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			if (!this.item) return;
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListWardByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 3) { //cấp xã
				this.item.Id_Xa = res.ID_Goc;
				this.filterward = '' + this.item.Id_Xa;
				if (this.item.Id == 0) {
					this.loadGetListWardByProvinces(this.filterprovinces);
					this.loadKhomAp();
				}
			}
		})

		this.loadListGioiTinh();
		this.loadListDoiTuongNCC();
		this.loadListQuanHeVoiLietSy();

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.loadGetListWardByProvinces(this.item.ProvinceID);
					this.filterward = '' + this.item.Id_Xa;
					this.loadKhomAp();
					this.createForm();
					this.quanhe = this.item.QuanHeVoiLietSy;
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
			NgaySinh: [this.item.NgaySinh],
			NamSinh: [this.item.NamSinh, Validators.required],
			GioiTinh: ['' + this.item.GioiTinh, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			Id_Xa: ['' + this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp ? '' + this.item.Id_KhomAp : null, Validators.required],
			Id_DoiTuongNCC: ['' + this.item.Id_DoiTuongNCC, Validators.required],
			NguoiThoCungLietSy: [this.item.NguoiThoCungLietSy],
			QuanHeVoiLietSy: [this.item.QuanHeVoiLietSy ? '' + this.item.QuanHeVoiLietSy : null],
		};
		this.itemForm = this.fb.group(temp);

		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit) 
			this.itemForm.disable();
		
		this.changeDetectorRefs.detectChanges();
	}

	getTitle(): string {
		let result = this.translate.instant('COMMON.CREATE');
		if (!this.allowEdit) {
			result = 'Xem chi tiết';
			return result;
		}
		if (!this.item || !this.item.Id) {
			return result;
		}
		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng nhận quà`;
		return result;
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
	prepare(): DoiTuongNhanQuaModel | null {
		if (!this.itemForm) return null;
		const controls = this.itemForm.controls;
		const _item = new DoiTuongNhanQuaModel();
		_item.Id = +this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_DoiTuongNCC = +controls.Id_DoiTuongNCC.value;
		_item.QuanHeVoiLietSy = 0;
		_item.NguoiThoCungLietSy = controls.NguoiThoCungLietSy.value;
		if (controls.QuanHeVoiLietSy.value != null)
			_item.QuanHeVoiLietSy = +controls.QuanHeVoiLietSy.value;
		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		_item.NamSinh = +controls.NamSinh.value;
		return _item;
	}
	
	onSubmit(withBack: boolean = false) {
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
		if (controls["NguoiThoCungLietSy"].value !== '' && controls["QuanHeVoiLietSy"].value == null) {
			this.layoutUtilsService.showInfo("Vui lòng chọn mối quan hệ gia đình");
			return;
		}

		const Edit = this.prepare();
		if (!Edit) return;
		if (Edit.Id > 0) {
			this.Update(Edit, withBack);
		} else {
			this.Create(Edit, withBack);
		}
	}

	Update(item: DoiTuongNhanQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					this.dialogRef.close({ item });
				} else {
					this.change = true;
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
				}
			} else {
				if (res.error.allowForce) {
					const _title = res.error.message;
					const _description = res.error.message + ", tiếp tục?";
					const _waitDesciption = "Yêu cầu đang được xử lý";
					const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						let copy: any = Object.assign({}, item);
						copy.IsForce = true;
						this.Update(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	Create(item: DoiTuongNhanQuaModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.create(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack) {
					let temp = Object.assign({}, res.data);
					temp.DiaChi = this.listKhomAp.find(x => +x.id == +res.data.Id_KhomAp).title;
					temp.HoTen = res.data.HoTen
					temp.NguoiThoCungLietSy = res.data.NguoiThoCungLietSy
					if (res.data.QuanHeVoiLietSy > 0)
						temp.QuanHeVoiLietSy = this.listOpt1.find(x => +x.id == +res.data.QuanHeVoiLietSy).title;
					else
						temp.QuanHeVoiLietSy = "";
					this.dialogRef.close(temp);
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					if (this.focusInput)
						this.focusInput.nativeElement.focus();
					this.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				if (res.error.allowForce) {
					const _title = res.error.message;
					const _description = res.error.message + ", tiếp tục?";
					const _waitDesciption = "Yêu cầu đang được xử lý";
					const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) return;
						let copy: any = Object.assign({}, item);
						copy.IsForce = true;
						this.Create(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	changeQuanHeLietSy() {
		if (!this.itemForm) return;
		if (this.itemForm.controls.NguoiThoCungLietSy) 
			this.require = '';
		else 
			this.require = 'require';
	}

	loadGetListWardByProvinces(idDistrict: any) {
		this.commonService.GetListWardByProvince(idDistrict).subscribe(res => {
			this.listward = res.data;
			this.listwardOpt = res.data;
			this.listwardFiltered.next(res.data ? res.data.slice() : []);
			this.changeDetectorRefs.detectChanges();
		});
	}

	filter() {
		if (!this.listOpt) return;
		let search = this.FilterCtrl;
		if (!search) {
			this.listdoituongncc.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listdoituongncc.next(
			this.listOpt.filter(ts => ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter1() {
		if (!this.listOpt1) return;
		let search = this.FilterCtrl1;
		if (!search) {
			this.listquanhevoilietsy.next(this.listOpt1.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listquanhevoilietsy.next(
			this.listOpt1.filter(ts => ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	filter2() {
		if (!this.listwardOpt) return;
		let search = this.FilterCtrl2;
		if (!search) {
			this.listwardFiltered.next(this.listwardOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listwardFiltered.next(
			this.listwardOpt.filter(w => w.Ward.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	loadKhomAp() {
		this.commonService.GetListKhomApByWard2(this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNhanQua(false).subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhByQua().subscribe(res => {
			this.listOpt1 = res.data;
			this.listquanhevoilietsy.next( res.data);
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

	onAlertClose() {
		this.hasFormErrors = false;
	}

	close() {
		this.dialogRef.close(this.change);
	}
}