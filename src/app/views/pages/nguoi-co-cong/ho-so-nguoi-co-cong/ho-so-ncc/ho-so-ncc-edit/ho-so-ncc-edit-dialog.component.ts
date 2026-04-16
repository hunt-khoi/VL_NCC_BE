import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, Type, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel, TypesUtilsService } from '../../../../../../core/_base/crud';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from '../../../../../../core/auth/_services/token-storage.service';
import { ThanNhanService } from './../../than-nhan/Services/than-nhan.service';
import { HoSoNCCService } from './../Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../../ho-so-ncc/Model/ho-so-ncc.model';
import { QuaTrinhHoatDongEditComponent, TroCapRowEditComponent, DiChuyenEditComponent, ThanNhanEditComponent } from '../../../components';

@Component({
	selector: 'kt-ho-so-ncc-edit',
	templateUrl: './ho-so-ncc-edit-dialog.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HoSoNCCEditDialogComponent implements OnInit {
	//#region nhúng mảng form trợ cấp
	lstTC: any[] = [];
	childComponentType = TroCapRowEditComponent;

	@ViewChild("libInsertion", { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef
	//#endregion
	//#region nhúng form hoạt động
	ChildComponentInstance1: any;
	childComponentType1 = QuaTrinhHoatDongEditComponent;
	childComponentData1 = {
		_item: { Id: 0 },
		hideOther: true,
		allowEdit: true
	};
	//#endregion
	//#region nhúng form di chuyển
	ChildComponentInstance2: any;
	childComponentType2 = DiChuyenEditComponent;
	childComponentData2 = {
		_item: { Id: 0 },
		ncc: null,
		hideOther: true,
		allowEdit: true
	};
	//#endregion
	//#region thân nhân
	ChildComponentInstance3: any;
	childComponentType3: Type<any>;
	childComponentData3: any = {
		_item: { Id: 0 },
		hideOther: true,
		allowEdit: true
	};
	//#endregion

	item: HoSoNCCModel;
	oldItem: HoSoNCCModel;
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

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listAllLoaiHS: any = [];
	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listLoaiHS: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listquanhevoilietsy: any[] = [];
	listthannhan: any[] = [];
	filterthannhan = '';
	listKhomAp: any[] = [];
	listDanToc: any[] = [];
	listTonGiao: any[] = [];
	GiayTos: any[] = [];
	thannhanName = '';
	quanhe: number;
	require = '';
	objectThanNhan: any;
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	IsThanNhan: boolean;
	Capcocau: number;
	Id_LoaiHoSo: number;
	//
	NhomDoiTuong: number = 1;
	nhapTC: boolean = true;
	nhapHD: boolean = true;
	nhapDC: boolean = true;

	constructor(private componentFactoryResolver: ComponentFactoryResolver,
		public dialogRef: MatDialogRef<HoSoNCCEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: HoSoNCCService,
		private thannhanService: ThanNhanService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		this._NAME = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.item = this.data._item;
		this.childComponentData2.ncc = this.item;
		this.childComponentType3 = ThanNhanEditComponent;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.changeDetectorRefs.detectChanges();
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 3)//cấp xã
			{
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

		this.commonService.ListDanToc().subscribe(res => {
			this.listDanToc = res.data;
		});
		this.commonService.ListTonGiao().subscribe(res => {
			this.listTonGiao = res.data;
		});
		this.loadListGioiTInh();

		this.loadListDoiTuongNCC();

		this.loadListQuanHeVoiLietSy();

		this.loadListThanNhan();

		this.createForm();
		if (this.item.Id > 0) {
			this.viewLoading = true;
			this.objectService.getItem(this.item.Id).subscribe(res => {
				this.viewLoading = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					this.item = res.data;
					this.changeDoiTuongNCC(this.item.Id_DoiTuongNCC);
					this.changeLoaiHS(this.item.Id_LoaiHoSo);
					this.loadGetListWardByDistrict(this.item.DistrictID);
					this.filterward = '' + this.item.Id_Xa;
					this.loadKhomAp();
					this.createForm();
					this.quanhe = this.item.QuanHeVoiLietSy;
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
		else
			this.addTC();
	}

	getInstance($event) {
		//this.ChildComponentInstance = $event;
	}
	getInstanceNew($event, index) {
		this.lstTC[index] = $event;
	}
	getInstance1($event) {
		this.ChildComponentInstance1 = $event;
	}
	getInstance2($event) {
		this.ChildComponentInstance2 = $event;
	}

	getInstance3($event) {
		this.ChildComponentInstance3 = $event;
	}
	onChangeNhomDoiTuong(value) {
		this.nhapDC = value == 1;
		this.nhapTC = value == 2 || value == 3 || value == 4;
		for (var i = 0; i < this.lstTC.length; i++) {
			this.lstTC[i].hideNuoiDuong = false;
			this.lstTC[i].hideMuaBao = false;
			if (value == 3) {
				//ẩn trợ cấp báo, nuôi dưỡng
				this.lstTC[i].hideNuoiDuong = true;
				this.lstTC[i].hideMuaBao = true;
			}
			if (value == 4) {
				//ẩn trợ cấp báo
				this.lstTC[i].hideMuaBao = true;
			}
			this.lstTC[i].changeDetectorRefs.detectChanges();
		}
	}
	changeDoiTuongNCC(value) {
		var f = this.listOpt.find(x => x.id == value);
		if (f) {
			this.IsThanNhan = f.data.IsThanNhan;
			this.changeDetectorRefs.detectChanges();
		}

		for (var i = 0; i < this.lstTC.length; i++) {
			if (this.lstTC[i].cmpRef && !this.lstTC[i].cmpRef.hostView.destroyed) {
				this.lstTC[i].LoadListLoaiTroCap(value);
			}
		}
		//lọc loại hồ sơ theo đối tượng ncc
		let temp = this.listAllLoaiHS.filter(x => x.data.Id_DoiTuongNCC == value);
		this.listLoaiHS.next(temp);
		this.listOpt1 = temp;
	}
	changeLoaiHS(value) {
		let xa = "";
		if (this.itemForm.controls["Id_Xa"].value) {
			let fx = this.listward.find(x => x.ID_Row == this.itemForm.controls["Id_Xa"].value);
			if (fx)
				xa = fx.Ward;
		}
		this.Id_LoaiHoSo = +value;
		var f = this.listOpt1.find(x => x.id == value);
		if (f) {
			this.GiayTos = f.data.GiayTos.map(x => { return { Id_LoaiGiayTo: x.id, GiayTo: x.title, IsRequired: x.IsRequired, NoiCap: xa } });
			this.changeDetectorRefs.detectChanges();
		}
	}

	createForm() {
		let ng;
		if (this.item.Id > 0)
			ng = moment(this.item.NgayGui);
		else
			ng = new Date();
		const temp: any = {
			NgayGui: [ng, Validators.required],
			SoHoSo: [this.item.SoHoSo],
			HoTen: [this.item.HoTen, Validators.required],
			DiaChi: [this.item.DiaChi],
			SDT: [this.item.SDT, [Validators.pattern(this.commonService.ValidateFormatRegex('phone')), Validators.maxLength(11)]],
			Email: [this.item.Email, [Validators.email]],
			NgaySinh: [this.item.NgaySinh],
			NamSinh: [this.item.NamSinh],
			GioiTinh: [this.item.GioiTinh, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			District: [this.item.DistrictID, Validators.required],
			Id_Xa: [this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp, Validators.required],
			DanToc: [this.item.Id_DanToc == null ? 0 : this.item.Id_DanToc],
			TonGiao: [this.item.Id_TonGiao == null ? 0 : this.item.Id_TonGiao],
			IdThanNhan: [this.item.Id_ThanNhan],
			Id_DoiTuongNCC: [this.item.Id_DoiTuongNCC, Validators.required],
			Id_LoaiHoSo: [this.item.Id_LoaiHoSo, Validators.required],
			//NguoiThoCungLietSy: [this.item.NguoiThoCungLietSy],
			//QuanHeVoiLietSy: [this.item.QuanHeVoiLietSy],
			//NguyenQuan1: [this.item.NguyenQuan1],
			//TruQuan1: [this.item.TruQuan1],
			//NgaySinh1: [this.item.NgaySinh1],
			//NamSinh1: [this.item.NamSinh1],
			//GioiTinh1: [this.item.GioiTinh1],
			BiDanh: [this.item.BiDanh],
			NguyenQuan: [this.item.NguyenQuan],
			TruQuan: [this.item.TruQuan],
			NgayNhapNgu: [this.item.NgayNhapNgu],
			NgayXuatNgu: [this.item.NgayXuatNgu],
			NoiCongTac: [this.item.NoiCongTac],
			CapBac: [this.item.CapBac],
			ChucVu: [this.item.ChucVu],
			Ngay_: [this.item.Ngay_],
			TruongHop_: [this.item.TruongHop_],
			Noi_: [this.item.Noi_],
			Mo: [this.item.Mo == null ? 0 : this.item.Mo],
			TiLe: [this.item.TiLe],
			fileDinhKem: [this.item.FileDinhKem ? [this.item.FileDinhKem] : null],
		};

		this.itemForm = this.fb.group(temp);
		//this.itemForm.controls.SoHoSo.markAsTouched();
		//this.itemForm.controls.HoTen.markAsTouched();
		//this.itemForm.controls.NgaySinh.markAsTouched();
		//this.itemForm.controls.DiaChi.markAsTouched();
		//this.itemForm.controls.GioiTinh.markAsTouched();
		//this.itemForm.controls.Province.markAsTouched();
		//this.itemForm.controls.District.markAsTouched();
		//this.itemForm.controls.IdThanNhan.markAllAsTouched();
		//this.itemForm.controls.Id_Xa.markAsTouched();
		//this.itemForm.controls.Id_DoiTuongNCC.markAsTouched();
		//this.itemForm.controls.NguoiThoCungLietSy.markAsTouched();
		//this.itemForm.controls.QuanHeVoiLietSy.markAsTouched();

		this.focusInput.nativeElement.focus();

		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		if (this.item.Id > 0) {
			this.itemForm.controls.NguoiThoCungLietSy.disable();
			this.itemForm.controls.QuanHeVoiLietSy.disable();
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

		result = this.translate.instant('COMMON.UPDATE') + ` hồ sơ người có công`;
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
	changeNS1(isNam = false) {
		if (isNam) {
			this.itemForm.controls.NgaySinh1.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh1.value;
			if (val != null) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh1.setValue(y);
			}
		}
	}

	/** ACTIONS */
	prepareCustomer(): HoSoNCCModel {

		const controls = this.itemForm.controls;
		const _item = new HoSoNCCModel();
		_item.Id = +this.item.Id;
		_item.NgayGui = moment(controls.NgayGui.value).format("YYYY-MM-DDTHH:mm:ss.0000000");
		_item.HoTen = controls.HoTen.value;
		_item.BiDanh = controls.BiDanh.value;
		_item.SoHoSo = controls.SoHoSo.value;
		_item.GioiTinh = +controls.GioiTinh.value;
		_item.DiaChi = controls.DiaChi.value;
		_item.SDT = controls.SDT.value;
		_item.Email = controls.Email.value;
		_item.Id_Xa = +controls.Id_Xa.value;
		_item.Id_KhomAp = +controls.Id_KhomAp.value;
		_item.Id_DoiTuongNCC = +controls.Id_DoiTuongNCC.value;
		_item.Id_LoaiHoSo = +controls.Id_LoaiHoSo.value;
		_item.QuanHeVoiLietSy = 0;
		if (this.item.Id == 0) {
			_item.Id_ThanNhan = 0;
			//_item.NguoiThoCungLietSy = controls.NguoiThoCungLietSy.value;
			//_item.NguyenQuan1 = controls.NguyenQuan1.value;
			//_item.TruQuan1 = controls.TruQuan1.value;
			//_item.GioiTinh1 = +controls.GioiTinh1.value;
			//if (controls.NgaySinh1.value !== '')
			//	_item.NgaySinh1 = this.commonService.f_convertDate(controls.NgaySinh1.value);
			//_item.NamSinh1 = +controls.NamSinh1.value;
			//if (controls.QuanHeVoiLietSy.value)
			//	_item.QuanHeVoiLietSy = +controls.QuanHeVoiLietSy.value;
			//_item.IsThanNhan = false;
			//if (_item.NguoiThoCungLietSy !== '') {
			//	_item.IsThanNhan = true;
			//}
		} else {
			if (controls.IdThanNhan.value != null)
				_item.Id_ThanNhan = +controls.IdThanNhan.value;
			else
				_item.Id_ThanNhan = 0;
		}

		if (controls.NgaySinh.value !== '')
			_item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		_item.NamSinh = +controls.NamSinh.value;
		_item.NguyenQuan = controls.NguyenQuan.value;
		_item.TruQuan = controls.TruQuan.value;
		if (controls.DanToc.value > 0)
			_item.Id_DanToc = controls.DanToc.value;
		if (controls.TonGiao.value > 0)
			_item.Id_TonGiao = controls.TonGiao.value;
		if (controls.NgayNhapNgu.value)
			_item.NgayNhapNgu = this.commonService.f_convertDate(controls.NgayNhapNgu.value);
		if (controls.NgayXuatNgu.value)
			_item.NgayXuatNgu = this.commonService.f_convertDate(controls.NgayXuatNgu.value);
		_item.NoiCongTac = controls.NoiCongTac.value;
		_item.CapBac = controls.CapBac.value;
		_item.ChucVu = controls.ChucVu.value;
		if (controls.Ngay_.value)
			_item.Ngay_ = this.commonService.f_convertDate(controls.Ngay_.value);
		_item.TruongHop_ = controls.TruongHop_.value;
		_item.Noi_ = controls.Noi_.value;
		if (controls.fileDinhKem.value && controls.fileDinhKem.value.length > 0)
			_item.FileDinhKem = controls.fileDinhKem.value[0];
		//_item.GiayBaoTu = controls.GiayBaoTu.value;
		//_item.BangTQGC = controls.BangTQGC.value;
		_item.Mo = controls.Mo.value;
		_item.TiLe = controls.TiLe.value;
		_item.GiayTos = [];
		for (var i = 0; i < this.GiayTos.length; i++) {
			let gt = this.GiayTos[i];

			if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) {
				if (!gt.So || !gt.NgayCap || !gt.NoiCap) {
					this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy tờ");
					return null;
				}
				let copy = Object.assign({}, gt);
				copy.FileDinhKem = gt.FileDinhKem[0];
				copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
				_item.GiayTos.push(copy);
			} else {
				if (gt.IsRequired) {
					this.layoutUtilsService.showInfo("Giấy tờ '" + gt.GiayTo + "' là bắt buộc nhập");
					return null;
				}
			}
		}
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
		//let ng = controls["NguoiThoCungLietSy"].value;
		//let qh = controls["QuanHeVoiLietSy"].value;
		//if (ng && !qh) {
		//	this.layoutUtilsService.showError("Vui lòng chọn mối quan hệ gia đình");
		//	return;
		//}
		let EditHoSoNCC: any = this.prepareCustomer();
		if (EditHoSoNCC == null)
			return;
		//tt thân nhân
		if (this.ChildComponentInstance3.itemForm.controls['HoTen'].value) {
			let EditThanNhan = this.ChildComponentInstance3.onSubmit();
			if (EditThanNhan == null) {
				this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin thân nhân");
				return;
			}
			EditHoSoNCC.ThanNhanModel = EditThanNhan;
		}
		if (this.nhapTC) {
			EditHoSoNCC.TroCapModel = [];
			//tt trợ cấp
			//let EditTroCap = this.ChildComponentInstance.onSubmit();
			//if (EditTroCap == null) {
			//	this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin trợ cấp");
			//	return;
			//}
			for (var i = 0; i < this.lstTC.length; i++) {
				if (this.lstTC[i].cmpRef && !this.lstTC[i].cmpRef.hostView.destroyed) {
					let EditTroCap = this.lstTC[i].onSubmit();
					if (EditTroCap == null) {
						this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin trợ cấp");
						return;
					}
					EditHoSoNCC.TroCapModel.push(EditTroCap);
				}
			}
		}
		if (this.nhapHD) {
			//tt hoạt động
			let EditTroCap = this.ChildComponentInstance1.onSubmit();
			if (EditTroCap == null) {
				this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin nội dung chứng tử");
				return;
			}
			EditHoSoNCC.HoatDongModel = EditTroCap;
		}
		if (this.nhapDC) {
			//tt di chuyển
			let EditTroCap = this.ChildComponentInstance2.onSubmit();
			if (!EditTroCap.isChuyenDi)//từ nơi khác chuyển đến
			{
				EditTroCap.IsDuyet = true;
				EditTroCap.Id_Xa_Old = EditTroCap.Id_Xa;
				EditTroCap.Id_Tinh = +controls["Province"].value;
				EditTroCap.Id_Huyen = +controls["District"].value;
				EditTroCap.Id_Xa = EditHoSoNCC.Id_Xa;

			}
			if (EditTroCap == null) {
				this.layoutUtilsService.showError("Vui lòng nhập đầy đủ thông tin di chuyển");
				return;
			}
			EditHoSoNCC.DiChuyenModel = EditTroCap;
		}
		if (EditHoSoNCC.Id > 0) {
			this.UpdateHoSoNCC(EditHoSoNCC, withBack);
		} else {
			this.CreateHoSoNCC(EditHoSoNCC, withBack);
		}
	}
	UpdateHoSoNCC(_item: HoSoNCCModel, withBack: boolean) {
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
	CreateHoSoNCC(_item: HoSoNCCModel, withBack: boolean) {
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
					this.lstTC = [];
					this.addTC();
					this.ChildComponentInstance1.ngOnInit();
					this.ChildComponentInstance2.ngOnInit();
					this.ChildComponentInstance3.ngOnInit();
				}
			} else {
				this.viewLoading = false;
				this.layoutUtilsService.showError(res.error.message);
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

	changeThanNhan(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName = this.objectThanNhan.HoTen;
		this.quanhe = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;

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

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNCC(false).subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
		this.commonService.liteConstLoaiHoSo(true).subscribe(res => {
			this.listAllLoaiHS = res.data;
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listquanhevoilietsy = res.data;
		});

	}
	// lay danh sach than nhan
	loadListThanNhan() {
		const queryParams = new QueryParamsModel({});
		queryParams.filter.Id_NCC = this.item.Id;
		this.thannhanService.findData(queryParams).subscribe(res => {
			this.listthannhan = res.data;
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
	changeDC(name) {
		let _name = name;
		if (name == 'TruQuan')
			_name = 'DiaChi';
		let dc = this.itemForm.controls[name].value;
		this.ChildComponentInstance3.itemForm.controls[_name].setValue(dc);
	}

	addTC($event = null) {
		let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.childComponentType);

		//let viewContainerRef = this.insertionPoint;
		//viewContainerRef.clear();

		let componentRef = this.insertionPoint.createComponent(componentFactory);
		let instance = componentRef.instance;
		instance.cmpRef = componentRef;
		instance.data = {
			_item: { Id: 0, Id_DoiTuongNCC: 0 },
			allowEdit: true,
			showDel: true,
			showCat:true
		};
		instance.close$.subscribe(() => {
			instance.cmpRef.destroy();
		});
		this.lstTC.push(instance);
		//if ($event != null)
		//	$event.stopPropagation();//preventDefault
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
}
