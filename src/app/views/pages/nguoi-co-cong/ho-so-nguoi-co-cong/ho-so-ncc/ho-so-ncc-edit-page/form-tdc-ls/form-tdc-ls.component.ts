import { ThanNhanService } from './../../../than-nhan/Services/than-nhan.service';
import { HoSoNCCService } from './../../Services/ho-so-ncc.service';
import { HoSoNCCModel } from '../../../ho-so-ncc/Model/ho-so-ncc.model';
import { Component, OnInit, Inject, ChangeDetectionStrategy, HostListener, ViewChild, ElementRef, ChangeDetectorRef, Type, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel, TypesUtilsService } from '../../../../../../../core/_base/crud';
import * as moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { TokenStorage } from '../../../../../../../core/auth/_services/token-storage.service';
import { TroCapRowEditComponent } from '../../../../components';
import { FormBaseComponent } from '../form-base.component';

@Component({
	selector: 'kt-form-tdc-ls',
	templateUrl: './form-tdc-ls.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormTDC_LSComponent extends FormBaseComponent implements OnInit {
	data: any;
	//#region nhúng mảng form trợ cấp
	lstTC: any[] = [];
	childComponentType = TroCapRowEditComponent;

	@ViewChild("libInsertion", { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef
	//#endregion

	item: HoSoNCCModel;
	oldItem: HoSoNCCModel;
	itemForm: FormGroup;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	isZoomSize: boolean = false;
	disabledBtn = false;
	allowEdit: boolean = true;

	@ViewChild('focusInput', { static: true }) focusInput: ElementRef;
	_NAME = '';
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	IsThanNhan: boolean;
	Capcocau: number;
	Id_LoaiHoSo: number;
	//
	nhapTC: boolean = true;
	//di chuyển
	isChuyenDi: boolean = false;

	constructor(private componentFactoryResolver: ComponentFactoryResolver,
		private fb: FormBuilder,
		public commonService: CommonService,
		private objectService: HoSoNCCService,
		private thannhanService: ThanNhanService,
		public layoutUtilsService: LayoutUtilsService,
		public changeDetectorRefs: ChangeDetectorRef,
		private typesUtilsService: TypesUtilsService,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
		super(commonService, layoutUtilsService, changeDetectorRefs);
		this._NAME = 'Hồ sơ người có công';
	}

	/** LOAD DATA */
	ngOnInit() {
		this.selectedTab = 0;
		this.item = this.data._item;
		this.Id_LoaiHoSo = this.item.Id_LoaiHoSo;
		if (this.data.allowEdit != undefined)
			this.allowEdit = this.data.allowEdit;
		this.loadProvinces();
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.filterprovinces = res.IdTinh;
			this.item.ProvinceID = this.filterprovinces;
			this.loadGetListDistrictByProvinces(this.filterprovinces);
			this.Capcocau = res.Capcocau;
			if (res.Capcocau == 2)//cấp huyen
			{
				this.filterdistrict = res.ID_Goc_Cha;
				this.item.DistrictID = +this.filterdistrict			
				if (this.item.Id == 0) {
					this.loadGetListWardByDistrict(this.filterdistrict);
				}
			}
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

		this.loadListDoiTuongNCC();
		this.loadListDanToc();
		this.loadListTonGiao();
		this.loadListGioiTinh();
		this.loadListQuanHeVoiLietSy();

		this.loadLoaiTC();
		this.createForm();
	}

	AllLoaiTroCap: any[] = [];
	listLoaiTroCap: any[] = [];
	loadLoaiTC() {
		this.commonService.liteConstLoaiTroCap().subscribe(res => {
			if (res && res.status == 1) {
				this.AllLoaiTroCap = res.data;
				this.listLoaiTroCap = this.AllLoaiTroCap.filter(x => x.id == 10);
			}
			this.addTC();
		})
	}

	getInstanceNew($event, index) {
		this.lstTC[index] = $event;
	}

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNCC(false, this.Id_LoaiHoSo).subscribe(res => {
			this.listdoituongncc.next(res.data);
			this.listOpt = res.data;
		});
		this.commonService.liteConstLoaiHoSo(true).subscribe(res => {
			this.listAllLoaiHS = res.data;
			this.listLoaiHS.next(res.data);
			this.listOpt1 = res.data;
			this.changeLoaiHS(this.item.Id_LoaiHoSo);
		});
	}

	isBangTQ: boolean = false;
	changeLoaiHS(value) {
		let xa = "";
		if (this.itemForm.controls["Id_Xa"].value) {
			let fx = this.listward.find(x => x.ID_Row == this.itemForm.controls["Id_Xa"].value);
			if (fx)
				xa = this.firstLowerCase(fx.Ward);
		}
		this.Id_LoaiHoSo = +value;
		var f = this.listOpt1.find(x => x.id == value);
		if (f) {
			this.GiayTos = f.data.GiayTos.map(x => { return { Id_LoaiGiayTo: x.id, GiayTo: x.title, IsRequired: x.IsRequired, NoiCap: xa } });
			var k = this.GiayTos.find(x => x.Id_LoaiGiayTo == 9) //bằng tổ quốc ghi công
			if(k)	this.isBangTQ = true;
			this.GiayTos = this.GiayTos.filter(x => x.Id_LoaiGiayTo != 9)
			this.changeDetectorRefs.detectChanges(); //lệnh này làm khi chọn xã mới, nơi cấp sẽ tự cập nhật là xã này
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
			GioiTinh: [1, Validators.required],
			Province: [this.item.ProvinceID, Validators.required],
			District: [this.item.DistrictID, Validators.required],
			Id_Xa: [this.item.Id_Xa, Validators.required],
			Id_KhomAp: [this.item.Id_KhomAp, Validators.required],
			DanToc: [this.item.Id_DanToc == null ? 0 : this.item.Id_DanToc],
			TonGiao: [this.item.Id_TonGiao == null ? 0 : this.item.Id_TonGiao],
			IdThanNhan: [this.item.Id_ThanNhan],
			Id_DoiTuongNCC: [this.item.Id_DoiTuongNCC, Validators.required],
			Id_LoaiHoSo: [this.item.Id_LoaiHoSo, Validators.required],
			//#region thông tin thân nhân
			NguoiThoCungLietSy: [''],
			QuanHeVoiLietSy: [0],
			NguyenQuan1: [''],
			TruQuan1: [''],
			NgaySinh1: [this.item.NgaySinh1],
			NamSinh1: [''],
			GioiTinh1: [1],
			IsChet1: [0],
			NgayChet1: [],
			SoKhaiTu1: [''],
			NgayKhaiTu1: [],
			NoiKhaiTu1: [''],
			SoHoSo1: [],
			//#endregion
			BiDanh: [''],
			NguyenQuan: [''],
			TruQuan: [''],
			NgayNhapNgu: [],
			NgayXuatNgu: [],
			NoiCongTac: [''],
			CapBac: [''],
			ChucVu: [''],
			Ngay_: [],
			TruongHop_: [''],
			Noi_: [''],
			Mo: [0],
			TiLe: [''],
			fileDinhKem: [null],
			IsChet: [0],
			NgayChet: [],
			NgayKhaiTu: [],
			//#region di chuyển
			tinhdc: [],
			huyendc: [],
			xadc: [],
			diaChidc: [''],
			DaGiaiQuyet: [''],
			ChuaGiaiQuyet: [''],
			ThucHien: [''],
			GiayTo: [''],
			IsBanChinh: [1],
			NgayChuyen: [],
			GhiChu: [''],
			//#endregion
			//#region 9. bằng tổ quốc ghi công
			GiayTo9: [''],
			So9: [''],
			NgayCap9: [],
			NoiCap9: [''],
			//#endregion
			//#region 1. giấy báo tử
			GiayTo1: [''],
			So1: [''],
			NgayCap1: [],
			NoiCap1: [''],
			//#endregion
			//#region đính chính
			HoTen_new: [''],
			NamSinh_new: [''],
			GhiChu_new: [''],
			//#endregion
		};

		this.itemForm = this.fb.group(temp);

		// this.focusInput.nativeElement.focus();
		
		if (!this.allowEdit) {
			this.itemForm.disable();
		}
		if (this.item.Id > 0) {
			this.itemForm.controls.NguoiThoCungLietSy.disable();
			this.itemForm.controls.QuanHeVoiLietSy.disable();
		}
		this.changeDetectorRefs.detectChanges();
		Object.keys(this.itemForm.controls).forEach(controlName =>
			this.itemForm.controls[controlName].markAsTouched()
		);
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
	changeDC(name) {
		let _name = name;
		if (name == 'TruQuan')
			_name = 'DiaChi';
		let dc = this.itemForm.controls[name].value;
		if (_name == 'NguyenQuan')
			this.itemForm.controls["NguyenQuan1"].setValue(dc);
		if (_name == 'DiaChi')
			this.itemForm.controls["TruQuan1"].setValue(dc);
	}

	onSubmit(withBack: boolean = false, callapi: boolean = false) {
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
		let EditHoSoNCC: any = this.prepareCustomer(this.itemForm, this.item.Id, this.data.id_ncc);
		if (EditHoSoNCC == null)
			return;
		if (this.nhapTC) {
			EditHoSoNCC.TroCapModel = [];
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
		if (!callapi)
			return EditHoSoNCC;
		else {
			this.disabledBtn = true;
			this.objectService.CreateHoSoNCC(EditHoSoNCC).subscribe(res => {
				this.disabledBtn = false;
				this.changeDetectorRefs.detectChanges();
				if (res && res.status === 1) {
					const _messageType = this.translate.instant('OBJECT.EDIT.ADD_MESSAGE', { name: this._NAME });
					this.layoutUtilsService.showInfo(_messageType);
					this.ngOnInit();
				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
		}
	}

	changeQuanHeLietSy() {
		if (this.itemForm.controls.NguoiThoCungLietSy) {
			this.require = '';
		} else {
			this.require = 'require';
		}
	}

	filterKhom = '';
	fillNguyenTruQuan(cap) {
		let val = this.findNguyenTruQuan(cap, this.filterKhom);

		this.itemForm.controls["NguyenQuan"].setValue(val);
		this.itemForm.controls["TruQuan"].setValue(val);
		this.itemForm.controls["NguyenQuan1"].setValue(val);
		this.itemForm.controls["TruQuan1"].setValue(val);
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

	addTC($event = null) {
		if (this.lstTC.length > 0) {
			this.lstTC = [];
			this.insertionPoint.clear()
		}

		for (var i=0; i<this.listLoaiTroCap.length; i++) {
			var item =  this.listLoaiTroCap[i]
			let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.childComponentType);

			let componentRef = this.insertionPoint.createComponent(componentFactory);
			let instance = componentRef.instance;
			instance.cmpRef = componentRef;
			if (item.id == 10) { //tc thờ cúng ls
				instance.data = {
					_item: { Id_LoaiTC: item.id, Title: item.title },
					allowEdit: true,
					showDel: true,
					showCat: true,
					showTamDinhChiLyDo: true,
					showNamCat: true
				};
			}

			instance.close$.subscribe(() => {
				instance.cmpRef.destroy();
			});
			this.lstTC.push(instance);
		}
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
