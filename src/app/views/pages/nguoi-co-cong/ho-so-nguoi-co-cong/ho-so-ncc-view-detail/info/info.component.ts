import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HoSoNCCModel } from '../../ho-so-ncc/Model/ho-so-ncc.model';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { ReplaySubject } from 'rxjs';
import moment from 'moment';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';

@Component({
	selector: 'kt-info',
	templateUrl: './info.component.html',
})

export class InfoComponent implements OnInit {
	objectId: string | null = null;
	item: HoSoNCCModel;
	oldItem: HoSoNCCModel;
	itemForm: FormGroup | undefined;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	allowEdit = true;
	filterprovinces = '';
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward: string = '';
	listKhomAp: any[] = [];
	listgioitinh: any[] = [];

	FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	FilterCtrl1: string = '';
	listAllLoaiHS: any[] = [];
	listOpt1: any[] = [];
	listLoaiHS: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	listDanToc:any[]=[];
	listTonGiao:any[]=[];
	Capcocau: number = 0;
	listquanhevoilietsy: any[] = [];
	lstTemplate: any[] = [];
	require = 'require';
	data: any;
	maxNS = moment(new Date()).add(-16, 'year').toDate();
	@ViewChild('focusInput', { static: true }) focusInput: ElementRef | undefined;

	constructor(
		private actRoute: ActivatedRoute,
		private fb: FormBuilder,
		private commonService: CommonService,
		private objectService: HoSoNCCService,
		private layoutUtilsService: LayoutUtilsService,
		private changeDetectorRefs: ChangeDetectorRef,
		private tokenStorage: TokenStorage,
		private translate: TranslateService) {
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
			this.listLoaiHS.next(this.listOpt1.slice());
			return;
		} else {
			search = search.toLowerCase();
		}
		this.listLoaiHS.next(
			this.listOpt1.filter(ts => ts.title.toLowerCase().indexOf(search) > -1)
		);
		this.changeDetectorRefs.detectChanges();
	}

	changeHoSo(id_hs: number) {
		let temp = this.listAllLoaiHS.filter(x => x.id == id_hs);
		this.listOpt1 = temp;
		this.listLoaiHS.next(temp);
	}

	changeDoiTuong(id_dt: number) {
		let temp = this.listOpt.filter(x => x.id == id_dt);
		this.listOpt = temp;
		this.listdoituongncc.next(temp);
	}

	ngOnInit() {
		this.item = new HoSoNCCModel();
		this.item.clear();

		this.actRoute.paramMap.subscribe(params => {
			this.objectId = params.get('id');
			this.item.Id = parseInt(this.objectId || '0');
		});
		this.tokenStorage.getUserInfo().subscribe(res => {
			this.Capcocau = res.Capcocau;
		});

		this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
		});
		this.commonService.ListDanToc().subscribe(res => {
			this.listDanToc = res.data;
		});
		this.commonService.ListTonGiao().subscribe(res => {
			this.listTonGiao = res.data;
		});
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
					this.changeDoiTuong(this.item.Id_DoiTuongNCC);
					this.changeHoSo(this.item.Id_LoaiHoSo);
					this.allowEdit = res.data.AllowEdit;
					this.loadGetListDistrictByProvinces(this.item.ProvinceID);
					this.loadGetListWardByDistrict(this.item.DistrictID);
					this.filterward = '' + this.item.Id_Xa;
					this.loadKhomAp();
					this.showTruongThongTin(res.data.Id_LoaiHoSo, res.data.Id_DoiTuongNCC)
					this.createForm();

				} else {
					this.layoutUtilsService.showError(res.error.message);
				}
			});
			this.objectService.GetTemplateByNCC(this.item.Id).subscribe(res => {
				if (res && res.status == 1)
					this.lstTemplate = res.data;
			});
		}
	}

	showNgayBiBenh = false;
	showNoiBenh = false;
	showTHBenh = false;
	showNgayHySinh = false;
	showNoiHySinh = false;
	showTiLe = false;
	showMo = false;
	showDienThoai = false;
	showNgayNhapNgu = false;
	showCapBac = false;
	showChucVu = false;
	showNoiCongTac = false;
	showNgayXuatNgu = false;
	showTGThamGia = false;
	showBangKhen = false;
	showHuanChuong = false;
	showNgayXet = false;
	showGioXet = false;
	showTPXet = false;
	showNDPhongTang = false;
	showLyDoTangTuat = false;
	showLyDoYKhoa = false;
	showLyDoDinhChinh = false;
	showLyDoThoCung = false;
	showCanCuLS = false;
	showDanToc = false;
	showTonGiao = false;
	showTinhTrangHT = false;
	showGhiChuTT = false;
	showNDCanCu = false;

	showTruongThongTin(Id_loaihs: number, Id_doituong: number) {
		if ( ((Id_doituong == 2 || Id_doituong == 17) && Id_loaihs == 15) 
			|| (Id_doituong == 3 || Id_loaihs == 42)) {
			this.showNgayBiBenh = true;
		}
		if (Id_doituong == 12 && Id_loaihs == 20) {
			this.showTGThamGia = true;
			this.showBangKhen = true;
			this.showHuanChuong = true;
		}
		if ((Id_doituong == 18 || Id_doituong == 19 || Id_doituong == 21 ) && Id_loaihs == 20) {
			this.showHuanChuong = true;
		}
		//giấy báo tử ls
		if (Id_doituong == 5 && Id_loaihs == 11) {
			this.showTHBenh = true;
			this.showNgayHySinh = true;
			this.showNoiHySinh = true;
			this.showMo = true;
			this.showNgayNhapNgu = true;
			this.showCapBac = true;
			this.showChucVu = true;
			this.showNoiCongTac = true;
		}
		//tăng mới bm vnah
		if (Id_doituong == 1 && Id_loaihs == 24) {
			this.showNgayXet = true;
			this.showGioXet = true;
			this.showTPXet = true;
			this.showNDPhongTang = true;
			this.showDanToc = true;
			this.showTonGiao = true;
			this.showTinhTrangHT = true; 
			this.showGhiChuTT = true; 
			this.showCanCuLS = true;
		}
		if ((Id_doituong == 3 || Id_doituong == 17 || Id_doituong == 5) && Id_loaihs == 12) {
			this.showTiLe = true;
			this.showDienThoai = true;
			this.showLyDoYKhoa = true;
		}
		if (Id_doituong == 5 && Id_loaihs == 18) {
			this.showLyDoTangTuat = true;
		}
		if (Id_doituong == 5 && Id_loaihs == 19) {
			this.showLyDoThoCung = true;
		}
		if ( (Id_doituong == 5 && Id_loaihs == 22) ||
			( (Id_doituong == 2 || Id_doituong == 3 || Id_doituong == 23 ||
			Id_doituong == 9 || Id_doituong == 11 || Id_doituong == 15 ||
			Id_doituong == 17 || Id_doituong == 19 || Id_doituong == 22) && Id_loaihs == 10) ) {
			this.showLyDoDinhChinh = true;
		}
		if (Id_doituong == 1 && Id_loaihs == 23) {
			this.showCanCuLS = true;
		}
		if (Id_doituong == 12 && (Id_loaihs == 41 || Id_loaihs == 40)) {
			this.showTGThamGia = true;
			this.showBangKhen = true;
			this.showHuanChuong = true;
		}
		if ( (Id_doituong == 1 || Id_doituong == 4 || Id_doituong == 8 || 
			Id_doituong == 9 || Id_doituong == 13 || Id_doituong == 15 || 
			Id_doituong == 16 || Id_doituong == 18 || Id_doituong == 19 || 
			Id_doituong == 21) && Id_loaihs == 20) {
				this.showHuanChuong = true;
		}
		if ( Id_doituong == 5 && Id_loaihs == 22) {
			this.showNDCanCu = true;
		}
	}

	createForm() {
		const temp: any = {
			NgayGui: [this.item.NgayGui, Validators.required],
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
			TinhTrangHT: [this.item.TinhTrangHT == null ? 0 : this.item.TinhTrangHT],
			TiLe: [this.item.TiLe],
			NgayHop: [this.item.NgayHop],
			GioHop: [this.item.GioHop],
			TPHop: [this.item.ThanhPhanHop],
			NoiXetDuyet: [this.item.NoiDungHop],

			TGThamGiaKC: [this.item.TGThamGiaKC],
			BangKhen: [this.item.BangKhenCacCap],
			NoiDungHC: [this.item.ND_HuanChuong],
			LyDoGTYKhoa: [this.item.LyDoGTYKhoa],
			LyDoTangTuat: [this.item.LyDoTangTuat],
			LyDoTC: [this.item.LyDoThoCung],
			LyDoDinhChinhTN: [this.item.LyDoDinhChinhTN],
			CanCuLietSy: [this.item.CanCuLietSy],

			NgayHS: [this.item.NgayHS],
			NoiHS: [this.item.NoiHS],
			GhiChuTruyTang: [this.item.GhiChuTruyTang],
			NoiDungCanCu: [this.item.ND_CanCu],
			fileDinhKem: [this.item.FileDinhKem ? [this.item.FileDinhKem] : null],
		};

		this.itemForm = this.fb.group(temp);
		if (this.focusInput)
			this.focusInput.nativeElement.focus();
		if (!this.allowEdit)
			this.itemForm.disable();
		this.changeDetectorRefs.detectChanges();
	}

	/** UI */
	getTitle(): string {
		return this.translate.instant('THONG_TIN_NCC.chitieths');
	}

	changeNS(isNam = false) {
		if (!this.itemForm) return;
		if (isNam) {
			this.itemForm.controls.NgaySinh.setValue('');
		}
		else {
			let val = this.itemForm.controls.NgaySinh.value;
			if (val) {
				let y = moment(val).get('year');
				this.itemForm.controls.NamSinh.setValue(y);
			}
		}
	}

	/** ACTIONS */
	prepare(): HoSoNCCModel | null {
		if (!this.itemForm) return null;
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
		if (controls.IdThanNhan.value != null)
			_item.Id_ThanNhan = +controls.IdThanNhan.value;
		else
			_item.Id_ThanNhan = 0;

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

		if (controls.NgayHop.value)
			_item.NgayHop = this.commonService.f_convertDate(controls.NgayHop.value);
		_item.GioHop = controls.GioHop.value ? controls.GioHop.value : "";
		_item.ThanhPhanHop = controls.TPHop.value ? controls.TPHop.value : "";
		_item.NoiDungHop = controls.NoiXetDuyet.value ? controls.NoiXetDuyet.value : "";
		_item.TGThamGiaKC = controls.TGThamGiaKC.value ? controls.TGThamGiaKC.value : 0;
		_item.BangKhenCacCap = controls.BangKhen.value ? controls.BangKhen.value : "";
		_item.ND_HuanChuong = controls.NoiDungHC.value ? controls.NoiDungHC.value : "";

		_item.LyDoGTYKhoa = controls.LyDoGTYKhoa.value ? controls.LyDoGTYKhoa.value : "";
		_item.LyDoTangTuat = controls.LyDoTangTuat.value ? controls.LyDoTangTuat.value : "";
		_item.LyDoTangTuat = controls.LyDoDinhChinhTN.value ? controls.LyDoDinhChinhTN.value : ""; 
		_item.LyDoThoCung = controls.LyDoTC.value ? controls.LyDoTC.value : ""; 
		_item.CanCuLietSy = controls.CanCuLietSy.value ? controls.CanCuLietSy.value : "";

		if (controls.NgayHS.value)
			_item.NgayHS = this.commonService.f_convertDate(controls.NgayHS.value);
		_item.NoiHS = controls.NoiHS.value ? controls.NoiHS.value : "";
		_item.GhiChuTruyTang = controls.GhiChuTruyTang.value
		_item.TinhTrangHT = controls.TinhTrangHT.value;

		return _item;
	}

	changeQuanHeLietSy() {
		if (!this.itemForm) return;
		if (this.itemForm.controls.NguoiThoCungLietSy) 
			this.require = 'require';
		else 
			this.require = '';
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

	loadListGioiTinh() {
		this.commonService.ListGioiTinh().subscribe(res => {
			this.listgioitinh = res.data;
		});
	}

	loadListDoiTuongNCC() {
		this.commonService.liteDoiTuongNCC().subscribe(res => {
			this.listOpt = res.data;
			this.listdoituongncc.next(res.data);
		});
		this.commonService.liteConstLoaiHoSo(true).subscribe(res => {
			this.listAllLoaiHS = res.data;
			this.listLoaiHS.next(res.data);
		});
	}

	loadListQuanHeVoiLietSy() {
		this.commonService.liteQHGiaDinhNCC().subscribe(res => {
			this.listquanhevoilietsy = res.data;
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

	back() {
		window.history.back();
	}

	DownloadFile(link: string) {
		window.open(link);
	}

	downAllFiles() {
		this.objectService.downAllFiles(this.objectId).subscribe(response => {
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
			this.layoutUtilsService.showError("Tải xuống các files không thành công");
		});
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
		let Edit: any = this.prepare();
		if (Edit)
			this.Update(Edit);
	}

	Update(item: HoSoNCCModel) {
		this.loadingAfterSubmit = true;
		this.viewLoading = true;
		this.disabledBtn = true;
		this.objectService.Update(item).subscribe(res => {
			this.disabledBtn = false;
			this.changeDetectorRefs.detectChanges();
			if (res && res.status === 1) {
				this.ngOnInit();
				const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: "Hồ sơ NCC" });
				this.layoutUtilsService.showInfo(_messageType);
				if (this.focusInput)
					this.focusInput.nativeElement.focus();
			} else {
				this.layoutUtilsService.showError(res.error.message);
			}
		});
	}
}