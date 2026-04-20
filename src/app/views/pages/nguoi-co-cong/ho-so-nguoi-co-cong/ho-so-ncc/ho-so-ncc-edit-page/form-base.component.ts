import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LayoutUtilsService } from 'app/core/_base/crud';
import moment from 'moment';
import { ReplaySubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { HoSoNCCModel } from '../Model/ho-so-ncc.model';

@Component({
	selector: 'kt-form-base',
	template: '',  
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FormBaseComponent {

	lstTC: any[] = [];
    FilterCtrl: string = '';
	listOpt: any[] = [];
	listdoituongncc: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
	listAllLoaiHS: any = [];
	FilterCtrl1: string = '';
	listOpt1: any[] = [];
	listLoaiHS: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	filterprovinces: number = 0;
	listprovinces: any[] = [];
	filterdistrict = '';
	listdistrict: any[] = [];
	listward: any[] = [];
	filterward = '';
	listgioitinh: any[] = [];

	listquanhevoilietsy: any[] = [];
	listthannhan: any[] = [];
	filterthannhan = '';
	listKhomAp: any[] = [];
	listDanToc: any[] = [];
	listTonGiao: any[] = [];
	GiayTos: any[] = [];
	thannhanName = '';
	quanhe: number = 0;
	thannhanName2 = '';
	quanhe2: number = 0;
	require = '';
	objectThanNhan: any;
	IsThanNhan: boolean = false;
	Capcocau: number = 0;

	//di chuyển
	listTinh: any[] = [];
	listHuyen: any[] = [];
	listXa: any[] = [];
	isChuyenDi: boolean = false;
	selectedTab: number = 0;

	constructor(public commonService: CommonService,
		public layoutUtilsService: LayoutUtilsService,
		public changeDetectorRefs: ChangeDetectorRef) { }
    
	getInstanceNew($event: any, index: number) {
		this.lstTC[index] = $event;
	}

	firstLowerCase(str: string) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	prepareCustomer(itemForm: any, id: number, id_ncc: number): HoSoNCCModel | null {
        const controls = itemForm.controls;
		const item = new HoSoNCCModel();
		item.Id = +id;
		item.NgayGui = moment(controls.NgayGui.value).format("YYYY-MM-DDTHH:mm:ss.0000000");
		item.HoTen = controls.HoTen.value;
		item.BiDanh = controls.BiDanh.value;
		item.SoHoSo = controls.SoHoSo.value;
		item.GioiTinh = +controls.GioiTinh.value;
		item.DiaChi = controls.DiaChi.value;
		item.SDT = controls.SDT.value;
		item.Email = controls.Email.value;
		item.Id_Xa = +controls.Id_Xa.value;
		item.Id_KhomAp = +controls.Id_KhomAp.value;
		item.Id_DoiTuongNCC = +controls.Id_DoiTuongNCC.value;
		item.Id_LoaiHoSo = +controls.Id_LoaiHoSo.value;
		item.QuanHeVoiLietSy = 0;
		if (id == 0) {
			item.Id_ThanNhan = 0;
			if (controls.NguoiThoCungLietSy.value) {
				if (controls.QuanHeVoiLietSy.value) {
					item.ThanNhanModel = this.prepareThanNhan(controls, id_ncc);
                }
				else {
					this.layoutUtilsService.showInfo("Vui lòng chọn quan hệ với đối tượng");
					return null;
				}
			}
		}

		//thân nhân đã mất
		if (id == 0 && this.checkForm(itemForm, 'HoTenTN') 
			&& this.checkForm(itemForm, 'QuanHeVoiLietSy2')) {
			item.Id_ThanNhan = 0;
			if (controls.HoTenTN.value) { //có nhập hoten than nhân đã mất
				if (controls.QuanHeVoiLietSy2.value)
					item.ThanNhanDaMat = this.prepareThanNhanDM(controls, id_ncc);
				else {
					this.layoutUtilsService.showInfo("Vui lòng chọn quan hệ với đối tượng");
					return null;
				}
			}
		}

		if (controls.NgaySinh.value !== '')
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh.value);
		item.NamSinh = +controls.NamSinh.value;
		item.NguyenQuan = controls.NguyenQuan.value;
		item.TruQuan = controls.TruQuan.value;
		if (controls.DanToc.value > 0)
			item.Id_DanToc = controls.DanToc.value;
		if (controls.TonGiao.value > 0)
			item.Id_TonGiao = controls.TonGiao.value;
		if (controls.NgayNhapNgu.value)
			item.NgayNhapNgu = this.commonService.f_convertDate(controls.NgayNhapNgu.value);
		if (controls.NgayXuatNgu.value)
			item.NgayXuatNgu = this.commonService.f_convertDate(controls.NgayXuatNgu.value);
		item.NoiCongTac = controls.NoiCongTac.value;
		item.CapBac = controls.CapBac.value;
		item.ChucVu = controls.ChucVu.value;
		if (controls.Ngay_.value)
			item.Ngay_ = this.commonService.f_convertDate(controls.Ngay_.value);
		item.TruongHop_ = controls.TruongHop_.value;
		item.Noi_ = controls.Noi_.value;
		if (controls.fileDinhKem.value && controls.fileDinhKem.value.length > 0)
			item.FileDinhKem = controls.fileDinhKem.value[0];

		item.Mo = controls.Mo.value;
		item.TiLe = controls.TiLe.value;

		if (this.checkForm(itemForm, 'NgayHS')) 
			item.NgayHS = this.commonService.f_convertDate(controls.NgayHS.value);
		if (this.checkForm(itemForm, 'NoiHS'))
			item.NoiHS = controls.NoiHS.value;
        if (this.checkForm(itemForm, 'TinhTrangHT'))
		    item.TinhTrangHT = controls.TinhTrangHT.value;
        if (this.checkForm(itemForm, 'GhiChuTruyTang'))
		    item.GhiChuTruyTang = controls.GhiChuTruyTang.value;
        if (this.checkForm(itemForm, 'NgayHop'))
            item.NgayHop = this.commonService.f_convertDate(controls.NgayHop.value);
        if (this.checkForm(itemForm, 'GioHop'))
            item.GioHop = controls.GioHop.value;
        if (this.checkForm(itemForm, 'ThanhPhanHop'))
            item.ThanhPhanHop = controls.ThanhPhanHop.value;
        if (this.checkForm(itemForm, 'NoiDungHop'))
            item.NoiDungHop = controls.NoiDungHop.value;
        if (this.checkForm(itemForm, 'CanCuLS'))
            item.CanCuLietSy = controls.CanCuLS.value;
		if (this.checkForm(itemForm, 'LyDoGTYKhoa'))
			item.LyDoGTYKhoa = controls.LyDoYKhoa.value;
		if (this.checkForm(itemForm, 'LyDoTangTuat'))
			item.LyDoTangTuat = controls.LyDoTangTuat.value;
		if (this.checkForm(itemForm, 'XetToTrinh'))
			item.XetToTrinh = controls.XetToTrinh.value;
		if (this.checkForm(itemForm, 'ThoiGianKC'))
			item.TGThamGiaKC = controls.ThoiGianKC.value;
		if (this.checkForm(itemForm, 'BangKhen'))
			item.BangKhenCacCap = controls.BangKhen.value;
		if (this.checkForm(itemForm, 'NoiDungHC'))
			item.ND_HuanChuong = controls.NoiDungHC.value;
		if (this.checkForm(itemForm, 'LyDoTC'))
			item.LyDoThoCung = controls.LyDoTC.value;
		if (this.checkForm(itemForm, 'LyDoDinhChi'))
			item.LyDoDinhChi = controls.LyDoDinhChi.value;
		if (this.checkForm(itemForm, 'LyDoTamDC'))
			item.LyDoTamDC = controls.LyDoTamDC.value;

		item.GiayTos = [];
		if (controls.GiayTo9.value) {
			if (controls.So9.value && controls.NgayCap9.value )
				item.GiayTos.push(this.prepareGT(controls, 9));
			else {
				this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của bằng tổ quốc ghi công");
				return null;
			}
		}
		item.IsChet = controls.IsChet.value;
		if (item.IsChet) {
			//thêm giấy báo tử
			if (controls.GiayTo1.value) {
				if (controls.So1.value && controls.NgayCap1.value && controls.NoiCap1.value)
					item.GiayTos.push(this.prepareGT(controls, 1));
				else {
					this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy báo tử");
					return null;
				}
			}
			//thêm quá trình hoạt động - đã mất
			item.HoatDongModel = this.prepareHD(controls);
		}
		for (var i = 0; i < this.GiayTos.length; i++) {
            let gt = this.GiayTos[i];

            if (gt.IsRequired) { //giấy tờ là bắt buộc
                if (!gt.So || !gt.NgayCap || !gt.NoiCap) {
                    this.layoutUtilsService.showInfo("Giấy tờ '" + gt.GiayTo + "' là bắt buộc nhập");
                    return null;
                }
                let copy = Object.assign({}, gt);
                if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) { //có chọn thêm file
					copy.FileDinhKem = gt.FileDinhKem[0];
				}
                copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
                item.GiayTos.push(copy);
            } else {
                if ((gt.So && !gt.NgayCap) || (!gt.So && gt.NgayCap) //chỉ nhập 1 trong 2 trường
					|| (gt.NoiCap && (!gt.So || !gt.NgayCap)) ) { //nhập trường nơi cấp mà trường So hoặc NgayCap ko nhập
                    this.layoutUtilsService.showInfo("Vui lòng nhập đầy đủ thông tin của giấy tờ");
                    return null;
                }
                if (gt.So && gt.NgayCap) { //đã nhập đủ 2 trường
                    let copy = Object.assign({}, gt);
                    if (gt.FileDinhKem != null && gt.FileDinhKem.length > 0) { //có chọn thêm file
                        copy.FileDinhKem = gt.FileDinhKem[0];
                
                    }
                    copy.NgayCap = this.commonService.f_convertDate(gt.NgayCap);
                    item.GiayTos.push(copy);
                }
            }
        }

        //item.DinhChinhModel = this.prepareDinhChinh(controls);
		//item.DiChuyenModel = this.prepareDC(controls);

		return item;
	}

    checkForm(itemForm: any, name: string) {
        if (itemForm.contains(name))
            return itemForm.controls[name].value ? true : false;
        return false;
    }

	prepareThanNhan(controls: any, id_ncc: number = 0) {
		let item: any = {};
		item.HoTen = controls.NguoiThoCungLietSy.value;
		item.DiaChi = controls.TruQuan1.value;
		item.SoHoSo = controls.SoHoSo1.value;
		item.NguyenQuan = controls.NguyenQuan1.value;
		item.GioiTinh = controls.GioiTinh1.value;
		item.Id_QHGiaDinh = controls.QuanHeVoiLietSy.value;
		item.IsChet = controls.IsChet1.value == true;
		if (item.IsChet) {
			item.NgayChet = this.commonService.f_convertDate(controls.NgayChet1.value);
			item.SoKhaiTu = controls.SoKhaiTu1.value;
			item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu1.value);
			item.NoiKhaiTu = controls.NoiKhaiTu1.value;
		}
		item.Id_NCC = id_ncc;

		if (controls.NgaySinh1.value !== '') {
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh1.value);
		} else {
			item.NgaySinh = '01/01/0001';
		}
		item.NamSinh = +controls.NamSinh1.value;
		return item;
	}

	prepareThanNhanDM(controls: any, id_ncc: number = 0) {
		let item: any = {};
		item.HoTen = controls.HoTenTN.value;
		item.DiaChi = controls.TruQuan2.value;
		item.SoHoSo = controls.SoHoSo2.value;
		item.NguyenQuan = controls.NguyenQuan2.value;
		item.GioiTinh = controls.GioiTinh2.value;
		item.Id_QHGiaDinh = controls.QuanHeVoiLietSy2.value;
		item.IsChet = controls.IsChet2.value == true;
		if (item.IsChet) {
			item.NgayChet = this.commonService.f_convertDate(controls.NgayChet2.value);
			item.SoKhaiTu = controls.SoKhaiTu2.value;
			item.NgayKhaiTu = this.commonService.f_convertDate(controls.NgayKhaiTu2.value);
			item.NoiKhaiTu = controls.NoiKhaiTu2.value;
		}
		item.Id_NCC = id_ncc;

		if (controls.NgaySinh2.value !== '') {
			item.NgaySinh = this.commonService.f_convertDate(controls.NgaySinh2.value);
		} else {
			item.NgaySinh = '01/01/0001';
		}
		item.NamSinh = +controls.NamSinh2.value;
		return item;
	}

	prepareHD(controls: any) {
		const item: any = {};
		if (controls.NgayChet.value)
			item.TuNgay = this.commonService.f_convertDate(controls.NgayChet.value); //ko bị trừ ngày khi save db
		if (controls.NgayKhaiTu.value)
			item.DenNgay = this.commonService.f_convertDate(controls.NgayKhaiTu.value);
		else
			item.DenNgay = null;
		item.IsNghiHuu = false
		item.IsChet = true
		return item;
	}

	prepareDC(controls: any): any {
		const item: any = {};
		item.Id_Tinh = controls.tinhdc.value;
		item.Id_Huyen = controls.huyendc.value;
		item.Id_Xa = controls.xadc.value;
		item.DiaChi = controls.diaChidc.value;
		item.DaGiaiQuyet = controls.DaGiaiQuyet.value;
		item.ChuaGiaiQuyet = controls.ChuaGiaiQuyet.value;
		item.NgayChuyen = controls.NgayChuyen.value;
		item.ThucHien = controls.ThucHien.value;
		item.GiayTo = controls.GiayTo.value;
		item.IsBanChinh = controls.IsBanChinh.value == 1;
		return item;
	}

	prepareGT(controls: any, id: number) {
		const item: any = {};
		item.Id_LoaiGiayTo = id;
		item.So = controls["So" + id].value;
		item.GiayTo = controls["GiayTo" + id].value;
		item.NoiCap = controls["NoiCap" + id].value;
		if (controls["NgayCap" + id].value)
			item.NgayCap = this.commonService.f_convertDate(controls["NgayCap" + id].value);
		else
			item.NgayCap = null;
		return item;
	}

	prepareDinhChinh(controls: any) {
		const item: any = {};
		item.GhiChu = controls.GhiChu_new.value;
		item.ListColumn = [];
		if (controls.HoTen_new.value)
			item.ListColumn.push({ 
                ColumName: 'hoten', 
                GiaTriCu: controls.HoTen.value, 
                GiaTriMoi: controls.HoTen_new.value, 
                Type: 1 });
		if (controls.NamSinh_new.value)
			item.ListColumn.push({ 
                ColumName: 'NamSinh', 
                GiaTriCu: controls.NamSinh.value, 
                GiaTriMoi: controls.NamSinh_new.value, 
                Type: 1 });
		return item;
	}

	changeThanNhan(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName = this.objectThanNhan.HoTen;
		this.quanhe = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;
	}

	changeThanNhan2(id: any) {
		this.objectThanNhan = this.listthannhan.find(x => x.Id == id);
		this.thannhanName2 = this.objectThanNhan.HoTen;
		this.quanhe2 = this.listquanhevoilietsy.find(x => this.objectThanNhan.Id_QHGiaDinh == x.title).id;
	}

	//#region di chuyển
	changeTinh(val: any) {
		this.commonService.GetListDistrictByProvinces(val).subscribe(res => {
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	changeHuyen(val: any) {
		this.commonService.GetListWardByDistrict(val).subscribe(res => {
			this.listXa = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}
	//#endregion

    loadProvinces() {
        this.commonService.GetAllProvinces().subscribe(res => {
			this.listprovinces = res.data;
			this.listTinh = res.data;
			this.changeDetectorRefs.detectChanges();
		});
    } 
	loadGetListDistrictByProvinces(idProvince: any) {
		this.commonService.GetListDistrictByProvinces(idProvince).subscribe(res => {
			this.listdistrict = res.data;
			this.listHuyen = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadGetListWardByDistrict(idDistrict: any) {
		this.commonService.GetListWardByDistrict(idDistrict).subscribe(res => {
			this.listward = res.data;
			this.listXa = res.data;
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

	loadKhomAp() {
		this.commonService.GetListKhomApByWard(this.filterward).subscribe(res => {
			this.listKhomAp = res.data;
			this.changeDetectorRefs.detectChanges();
		});
	}

    loadListDanToc() {
		this.commonService.ListDanToc().subscribe(res => {
			this.listDanToc = res.data;
		});
	}

    loadListTonGiao() {
		this.commonService.ListTonGiao().subscribe(res => {
			this.listTonGiao = res.data;
		});
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

	findNguyenTruQuan(cap: any, filterKhom: any): string {
		let val = "";
		var khom: any, xa: any, huyen: any, tinh: any;
		khom = this.listKhomAp.find(x => x.id == +filterKhom) //title
		xa = this.listXa.find(x => x.ID_Row == +this.filterward) //Ward
		huyen = this.listHuyen.find(x => x.ID_Row == +this.filterdistrict) //District
		tinh = this.listTinh.find(x => x.id_row == +this.filterprovinces) //Province
		switch (cap) {
			case 1: {
				val = this.firstLowerCase(tinh.Province)
				break;
			}
			case 2: {
				val = this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 3: {
				val = this.firstLowerCase(xa.Ward) + ", " + this.firstLowerCase(huyen.District) 
					+ ", " + this.firstLowerCase(tinh.Province)
				break;
			}
			case 4: {
				val = this.firstLowerCase(khom.title) + ", " + this.firstLowerCase(xa.Ward) 
					+ ", " + this.firstLowerCase(huyen.District) + ", " + this.firstLowerCase(tinh.Province)
				break;
			}
		}
        return val;
	}

	tieptuc() { this.selectedTab++; }
}