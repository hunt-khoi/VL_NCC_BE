import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, TypesUtilsService } from '../../../../../../core/_base/crud';
import moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { CommonService } from '../../../services/common.service';
import { DoiTuongBaoHiemService } from './../Services/doi-tuong-bao-hiem.service';
import { DoiTuongBaoHiemModel } from '../../doi-tuong-bao-hiem/Model/doi-tuong-bao-hiem.model';

@Component({
	selector: 'kt-doi-tuong-bao-hiem-edit',
	templateUrl: './doi-tuong-bao-hiem-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DoiTuongBaoHiemEditDialogComponent implements OnInit {
	item: DoiTuongBaoHiemModel;
	oldItem: DoiTuongBaoHiemModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit = false;
	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listquanhevoilietsy: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listKhomAp: any[] = [];
	require = '';
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	Capcocau: number = 0;
	change: boolean = false;
	IsReturn: boolean = false;

	constructor(public dialogRef: MatDialogRef<DoiTuongBaoHiemEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: DoiTuongBaoHiemService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = this.translate.instant('DOITUONGBHYT.NAME');
	}

	filter() {
		if (!this.listOpt) {
			return;
		}
		let search = this.FilterCtrl;
		if (!search) {
			this.listdoituongncc.next(this.listOpt.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listdoituongncc.next(
			this.listOpt.filter(ts =>
				ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	/** LOAD DATA */
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

		this.loadListGioiTinh();
		this.loadListDoiTuongBHYT();
		this.loadListQuanHeVoiLietSy();

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
					
				} else
					this.layoutUtilsService.showError(res.error.message);
			});
		}
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhByQua().subscribe(res => {
			this.listOpt1 = res.data;
			this.listquanhevoilietsy.next( res.data);
		});
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
			District: ['' + this.item.DistrictID, Validators.required],
			Id_Xa: ['' + this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp ? '' + this.item.Id_KhomAp : null, Validators.required],
			Id_DoiTuongBHYT: ['' + this.item.Id_DoiTuongBHYT, Validators.required],
			MaThe: [this.item.MaTheBHYT],
			MaTheBHXH: [this.item.MaTheBHXH],
			MucDong: [this.item.SoTien],
			MaKCB: [this.item.MaKCB],
			NoiDangKy: [this.item.NoiDangKyKCB],
			TienLuong: ['' + this.item.TienLuong],
			SoThang: [this.item.SoThangSuDung],
			NguyenQuan: [this.item.NguyenQuan],
			TruQuan: [this.item.TruQuan],
			ThanNhan: [this.item.ThanNhan],
			QuanHeVoiLietSy: [this.item.Id_QHGiaDinh],
			NgheNghiep: [this.item.NgheNghiep],
			NoiCongTac: [this.item.NoiCongTac],
			GhiChu: [this.item.GhiChu],
			fileDinhKems: [this.item.FileDinhKems],
		};

		this.itemForm = this.fb.group(temp);
		this.itemForm.controls.MucDong.disable();

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

		result = this.translate.instant('COMMON.UPDATE') + ` đối tượng bảo hiểm`;
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

	/** ACTIONS */
	prepareCustomer(): DoiTuongBaoHiemModel {
		const controls = this.itemForm.controls;
		const _item = new DoiTuongBaoHiemModel();
		_item.Id = +this.item.Id;
		_item.HoTen = controls.HoTen.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_DoiTuongBHYT = +controls.Id_DoiTuongBHYT.value;
		_item.MaKCB = controls.MaKCB.value;
		_item.NoiDangKyKCB = controls.NoiDangKy.value;
		_item.TienLuong = +controls.TienLuong.value; 
		_item.SoThangSuDung = +controls.SoThang.value;
		_item.MaTheBHYT = controls.MaThe.value;
		_item.MaTheBHXH = controls.MaTheBHXH.value;
		_item.NguyenQuan = controls.NguyenQuan.value;
		_item.TruQuan = controls.TruQuan.value;
		_item.NgheNghiep = controls.NgheNghiep.value;
		_item.NoiCongTac = controls.NoiCongTac.value;
		_item.GhiChu = controls.GhiChu.value;
		_item.ThanNhan = controls.ThanNhan.value;
		_item.Id_QHGiaDinh = +controls.QuanHeVoiLietSy.value;

		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		_item.NamSinh = +controls.NamSinh.value;

		_item.FileDinhKems = controls['fileDinhKems'].value;
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
		const EditDoiTuongBaoHiem = this.prepareCustomer();
		if (EditDoiTuongBaoHiem == null)
			return;
		if (EditDoiTuongBaoHiem.Id > 0) {
			this.UpdateDoiTuongBaoHiem(EditDoiTuongBaoHiem, withBack);
		} else {
			this.CreateDoiTuongBaoHiem(EditDoiTuongBaoHiem, withBack);
		}
	}

	UpdateDoiTuongBaoHiem(_item: DoiTuongBaoHiemModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.UpdateDoiTuongBaoHiem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					this.dialogRef.close({
						_item
					});
				} else {
					this.change = true;
					this.ngOnInit();
					const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
					this.focusInput.nativeElement.focus();
				}
			} else {
				if (res.error.allowForce) {
					const _title = res.error.message;
					const _description = res.error.message + ", tiếp tục?";
					const _waitDesciption = "Yêu cầu đang được xử lý";

					const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
					dialogRef.afterClosed().subscribe(res => {
						if (!res) {
							return;
						}
						let copy: any = Object.assign({}, _item);
						copy.IsForce = true;
						this.UpdateDoiTuongBaoHiem(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	CreateDoiTuongBaoHiem(_item: DoiTuongBaoHiemModel, withBack: boolean) {
		this.loadingAfterSubmit = true;
		// 	this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.CreateDoiTuongBaoHiem(_item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				if (withBack == true) {
					let temp = Object.assign({}, res.data);
					temp.DiaChi = this.listKhomAp.find(x => +x.id == +res.data.Id_KhomAp).title;
					temp.HoTen = res.data.HoTen
					this.dialogRef.close(temp);
				} else {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => { });
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
						if (!res) {
							return;
						}
						let copy: any = Object.assign({}, _item);
						copy.IsForce = true;
						this.CreateDoiTuongBaoHiem(copy, withBack);
					});
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			}
		});
	}

	changeQuanHeLietSy() {
		if (this.itemForm.controls.NguoiThoCungLietSy) {
			this.require = '';
		} else {
			this.require = 'require';
		}
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
		this.commonService.GetListKhomApByWard(+this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListDoiTuongBHYT() {
		this.commonService.liteDoiTuongBaoHiem(0, false).subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
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
		this.dialogRef.close(this.change);
	}

	@HostListener('document:keydown', ['$event'])
	onKeydownHandler(event: KeyboardEvent) {
		if (event.ctrlKey && event.keyCode == 13) {
			this.item = this.data._item;
			if (this.viewLoading == true) {
				this.onSubmit(true);
			} else {
				this.onSubmit(false);
			}
		}
	}
}
