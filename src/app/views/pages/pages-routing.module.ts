import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth';
import { BaseComponent } from '../theme/base/base.component';
import { PermissionUrl } from '../../core/auth/_services/permissionurl';
import { ErrorPageComponent } from '../theme/content/error-page/error-page.component';

const routes: Routes = [
	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: '',
				loadChildren: () => import('../../views/pages/dashboard/dashboard.module').then(m => m.DashboardModule)
			},
			{
				path: 'profile',
				loadChildren: () => import('../../views/pages/profile/profile.module').then(m => m.ProfileModule)
			},
			{
				path: 'hdsd',
				loadChildren: () => import('../../views/pages/hdsd/hdsd.module').then(m => m.hdsdModule)
			},
			//#region danh mục
			// {
			// 	path: 'chuc-vu',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/_chuc-vu/chuc-vu.module').then(m => m.ChucVuModule)
			// },
			{
				path: 'dan-toc',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/dantoc/dantoc.module').then(m => m.dantocModule)
			},
			{
				path: 'ton-giao',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/tongiao/tongiao.module').then(m => m.tongiaoModule)
			},
			{
				path: 'cap-quan-ly',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/capquanly/capquanly.module').then(m => m.capquanlyModule)
			},
			{
				path: 'chuc-vu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/chucvu/chucvu.module').then(m => m.chucvuModule)
			},
			{
				path: 'chuc-danh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/chucdanh/chucdanh.module').then(m => m.ChucDanhModule)
			},
			{
				path: 'so-do-to-chuc',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/so-do-to-chuc-new/so-do-to-chuc-new.module').then(m => m.SoDoToChucModule)
			},
			{
				path: 'co-cau-to-chuc',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/co-cau-to-chuc-moi-tree/co-cau-to-chuc-moi-tree.module').then(m => m.cocautochucmoiTreeModule)
			},
			{
				path: 'nhom-le-tet',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/nhomletet/nhomletet.module').then(m => m.nhomletetModule)
			},
			{
				path: 'dung-cu-chinh-hinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/dungcuchinhhinh/dungcuchinhhinh.module').then(m => m.dungcuchinhhinhModule)
			},
			{
				path: 'doi-tuong-ncc',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/doi-tuong-nguoi-co-cong/doi-tuong-nguoi-co-cong.module').then(m => m.DoiTuongNguoiCoCongModule)
			},
			{
				path: 'dien-chinh-hinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/dien-chinh-hinh/dien-chinh-hinh.module').then(m => m.DienChinhHinhModule)
			},
			{
				path: 'loai-dieu-duong',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/loai-dieu-duong/loaidieuduong.module').then(m => m.LoaiDieuDuongModule)
			},
			{
				path: 'danh-muc-khac',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/danh-muc-khac/danhmuckhac.module').then(m => m.DanhMucKhacModule)
			},
			{
				path: 'loai-giay-to',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/loai-giay-to/loaigiayto.module').then(m => m.LoaiGiayToModule)
			},
			{
				path: 'muc-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/muc-qua/muc-qua.module').then(m => m.MucQuaModule)
			},
			{
				path: 'qh-gia-dinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/quan-he-gia-dinh/quan-he-gia-dinh.module').then(m => m.QuanHeGiaDinhModule)
			},
			{
				path: 'che-do-uu-dai',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/che-do-uu-dai/che-do-uu-dai.module').then(m => m.CheDoUuDaiModule)
			},
			{
				path: 'so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/solieu/solieu.module').then(m => m.solieuModule)
			},
			{
				path: 'loai-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/loaisolieu/loaisolieu.module').then(m => m.loaisolieuModule)
			},
			{
				path: 'nguon-kinh-phi',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/nguon-kinh-phi/nguon-kinh-phi.module').then(m => m.NguonKinhPhiModule)
			},
			//#endregion
			//#region Quản trị
			{
				path: 'vai-tro',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/nguoi-dung/nhom-nguoi-dung-dps/nhom-nguoi-dung-dps.module').then(m => m.NhomNguoiDungDPSModule)
			},
			{
				path: 'nguoi-dung',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/nguoi-dung/nguoi-dung-dps/nguoi-dung-dps.module').then(m => m.NguoiDungDPSModule)
			},
			{
				path: 'don-vi',
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/dm-don-vi/dm-don-vi.module').then(m => m.DM_DonViModule)
			},
			{
				path: 'don-vi-hanh-chinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/donvihanhchinh/donvihanhchinh.module').then(m => m.DonViHanhChinh_Module)
			},
			{
				path: 'can-cu-bieu-mau',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/danh-muc/can-cu-bieu-mau/can-cu-bieu-mau.module').then(m => m.CanCuBieuMauModule)
			},
			{
				path: 'ngay-le',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/ngay-le/ngay-le.module').then(m => m.HolidayModule)
			},
			//#endregion
			//#region Quản lý
			{
				path: 'quy-trinh-duyet',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/nhap-quy-trinh-duyet/nhap-quy-trinh-duyet.module').then(m => m.NhapQuyTrinhDuyetModule)
			},
			{
				path: 'log',
				//canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/log/log.module').then(m => m.LogModule)
			},
			{
				path: 'sms-history',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/sms-history/sms-history.module').then(m => m.SMSHistoryModule)
			},
			// {
			// 	path: 'email-history',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/email-history/email-history.module').then(m => m.EmailHistoryModule)
			// },
			{
				path: 'theo-doi-quy-trinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-tri/qua-trinh-khong-co-nguoi-duyet/qua-trinh-khong-co-nguoi-duyet.module').then(m => m.QuaTrinhKhongCoNguoiDuyetModule)
			},
			//#endregion
			//#region Cấu hình
			{
				path: 'cau-hinh-he-thong',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/cau-hinh/config/config.module').then(m => m.ConfigModule)
			},
			{
				path: 'cau-hinh-email',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/cau-hinh/cau-hinh-email/cau-hinh-email.module').then(m => m.CauHinhEmailModule)
			},
			{
				path: 'cau-hinh-sms',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/cau-hinh/cau-hinh-sms/cau-hinh-sms.module').then(m => m.CauHinhSMSModule)
			},
			//#endregion
			//#region Hồ sơ người có công
			{
				path: 'chi-tiet-ho-so/:id',
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/ho-so-ncc-view-detail/ho-so-ncc-view-detail.module').then(m => m.HoSoNCCViewDetailModule),
			},
			{
				path: 'ho-so-ncc',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/ho-so-ncc/ho-so-ncc.module').then(m => m.HoSoNCCModule),
				data: { Status: 2 }
			},
			{
				path: 'tiep-nhan-ho-so',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/ho-so-ncc/ho-so-ncc.module').then(m => m.HoSoNCCModule)
			},
			{
				path: 'duyet-ho-so',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/ho-so-ncc-duyet/ho-so-ncc-duyet.module').then(m => m.HoSoNCCDuyetModule),
				data: { IsEnable_Duyet: false }
			},
			{
				path: 'ho-so-da-duyet',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/ho-so-ncc-duyet/ho-so-ncc-duyet.module').then(m => m.HoSoNCCDuyetModule),
				data: { IsEnable_Duyet: true }
			},
			{
				path: 'thong-ke-ho-so',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/bao-cao-thong-ke/bao-cao-thong-ke.module').then(m => m.BaoCaoThongKeModule)
			},
			{
				path: 'thoi-han-ho-so',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/thoi-han/thoi-han.module').then(m => m.ThoiHanModule)
			},
			{
				path: 'quyet-dinh',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/quyet-dinh/quyet-dinh.module').then(m => m.QuyetDinhModule)
			},
			{
				path: 'thong-ke-sl-ho-so',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-so-nguoi-co-cong/thong-ke-so-luong/thong-ke-so-luong.module').then(m => m.ThongKeSoLuongModule)
			},

			//#endregion
			//#region Quà lễ tết
			{
				path: 'doi-tuong-nhan-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/doi-tuong-nhan-qua/doi-tuong-nhan-qua.module').then(m => m.DoiTuongNhanQuaModule)
			},
			{
				path: 'dot-tang-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/dot-tang-qua/dot-tang-qua.module').then(m => m.dottangquaModule)
			},
			{
				path: 'de-xuat-tang-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/de-xuat-tang-qua/de-xuat-tang-qua.module').then(m => m.DeXuatTangQuaModule)
			},
			{
				path: 'danh-sach-de-xuat',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/de-xuat/de-xuat.module').then(m => m.DeXuatModule)
			},
			{
				path: 'duyet-de-xuat',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/de-xuat-duyet/de-xuat-duyet.module').then(m => m.DeXuatDuyetModule),
				data: { IsEnable_Duyet: false }
			},
			{
				path: 'de-xuat-da-duyet',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/de-xuat-duyet/de-xuat-duyet.module').then(m => m.DeXuatDuyetModule),
				data: { IsEnable_Duyet: true }
			},
			{
				path: 'thong-ke-tang-giam',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/thong-ke-tang-giam/thong-ke-tang-giam.module').then(m => m.thongkeTangGiamModule)
			},
			{
				path: 'thong-ke-chi-tra',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/tra-cuu-ho-so/tra-cuu-ho-so.module').then(m => m.traCuuHoSoModule)
			},
			{
				path: 'xuat-du-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/xuat-dot-tang-qua/xuat-du-lieu.module').then(m => m.xuatDuLieuModule)
			},
			{
				path: 'tinh-hinh-tang-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/bao-cao-tinh-hinh/bao-cao-tinh-hinh.module').then(m => m.BaoCaoTinhHinhModule)
			},
			{
				path: 'quyet-dinh-tang-qua',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/qua-le-tet/in-quyet-dinh/in-quyet-dinh.module').then(m => m.InQuyetDinhModule)
			},
			//#endregion
			//#region Quản lý so dữ liệu
			{
				path: 'mau-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/mau-so-lieu/mau-so-lieu.module').then(m => m.MauSoLieuModule)
			},
			{
				path: 'danh-sach-nhap',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/nhap-so-lieu/nhap-so-lieu.module').then(m => m.NhapSoLieuModule)
			},
			{
				path: 'duyet-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/nhap-so-lieu-duyet/nhap-so-lieu-duyet.module').then(m => m.NhapSoLieuDuyetModule),
				data: { IsEnable_Duyet: false }
			},
			{
				path: 'so-lieu-da-duyet',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/nhap-so-lieu-duyet/nhap-so-lieu-duyet.module').then(m => m.NhapSoLieuDuyetModule),
				data: { IsEnable_Duyet: true }
			},
			{
				path: 'thong-ke-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/thong-ke-nhap-so-lieu/so-lieu-thong-ke.module').then(m => m.SoLieuThongKeModule)
			},
			{
				path: 'nhap-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/new-nhap-so-lieu/new-nhap-so-lieu.module').then(m => m.NhapSoLieuModule)
			},
			{
				path: 'thoi-han-so-lieu',
				canActivate: [PermissionUrl],
				loadChildren: () => import('../../views/pages/nguoi-co-cong/quan-ly-mau-so-lieu/thoi-han-so-lieu/thoi-han-so-lieu.module').then(m => m.ThoiHanSoLieuModule)
			},
			//#endregion
			// //#region Quản lý niên hạn dụng cụ
			// {
			// 	path: 'doi-tuong-trang-cap',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/doi-tuong-trang-cap/doi-tuong-trang-cap.module').then(m => m.DoiTuongTrangCapModule)
			// },
			// {
			//  	path: 'quan-ly-nien-han',
			//  	canActivate: [PermissionUrl],
			//  	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/nien-han-doi-tuong/nien-han-doi-tuong.module').then(m => m.NienHanDoiTuongModule)
			// },
			// {
			// 	path: 'dot-nien-han',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/dot-nien-han/dot-nien-han.module').then(m => m.dotnienhanModule)
			// },
			// {
			// 	path: 'nhap-nien-han',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/nhap-nien-han/nhap-nien-han.module').then(m => m.NhapNienHanModule)
			// },
			// {
			// 	path: 'danh-sach-nien-han',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/nien-han/nien-han.module').then(m => m.NienHanModule)
			// },
			// {
			// 	path: 'duyet-nien-han',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/nien-han-duyet/nien-han-duyet.module').then(m => m.NienHanDuyetModule),
			// 	data: { IsEnable_Duyet: false }
			// },
			// {
			// 	path: 'nien-han-da-duyet',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/nien-han-duyet/nien-han-duyet.module').then(m => m.NienHanDuyetModule),
			// 	data: { IsEnable_Duyet: true }
			// },
			// {
			// 	path: 'du-toan-kinh-phi',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('./nguoi-co-cong/nien-han-dung-cu/du-toan-kinh-phi/du-toan-kinh-phi.module').then(m => m.dutoankinhphiModule)
			// },
			// {
			// 	path: 'xuat-du-toan',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('./nguoi-co-cong/nien-han-dung-cu/xuat-du-toan/xuat-du-toan.module').then(m => m.xuatDuToanModule)
			// },
			// {
			//   	path: 'thong-ke-so-luong',
			//   	canActivate: [PermissionUrl],
			//   	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/thong-ke-so-luong/thong-ke-so-luong.module').then(m => m.ThongKeSoLuongModule),
			// },
			// {
			// 	path: 'tang-giam-trang-cap',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/thong-ke-dc-tang-giam/thong-ke-dc-tang-giam.module').then(m => m.thongkeTangGiamModule),
		  	// },
			// {
			// 	path: 'tinh-hinh-trang-cap', 
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/nien-han-dung-cu/tinh-hinh-trang-cap/tinh-hinh-trang-cap.module').then(m => m.TinhHinhTrangCapModule),
		  	// },
			//#endregion
			//#region Đền ơn đáp nghĩa
		// 	{
		// 		path: 'dt-ho-tro-quy',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('./nguoi-co-cong/quy-den-on-dap-nghia/dt-ho-tro-quy/dt-ho-tro-quy.module').then(m => m.DTHoTroModule)
		// 	},
		// 	{
		// 		path: 'quan-ly-quy',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/quan-ly-quy/quan-ly-quy.module').then(m => m.QuanLyQuyModule)
		// 	},
		// 	{
		// 		path: 'dv-dong-gop',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/dv-dong-gop/dv-dong-gop.module').then(m => m.DVDongGopModule)
		// 	},
		// 	{
		// 		path: 'lap-ds-ho-tro',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/ho-tro/ho-tro.module').then(m => m.HoTroModule)
		// 	},
		// 	{
		// 		path: 'duyet-ds-ho-tro',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/ho-tro-duyet/ho-tro-duyet.module').then(m => m.HoTroDTuyetModule),
		// 		data: { IsEnable_Duyet: false }
		//    },
		//    {
		// 		path: 'ds-ho-tro-da-duyet',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/ho-tro-duyet/ho-tro-duyet.module').then(m => m.HoTroDTuyetModule),
		// 		data: { IsEnable_Duyet: true }
		//    },
		// 	{
		// 		path: 'ke-hoach-van-dong',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/ke-hoach-van-dong/ke-hoach-van-dong.module').then(m => m.KeHoachVanDongModule)
		// 	},
		// 	{
		// 		path: 'bao-cao-van-dong',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/bao-cao-van-dong/bao-cao-van-dong.module').then(m => m.BaoCaoVanDongModule)
		// 	},
		// 	{
		// 		path: 'bao-cao-thu-chi',
		// 		canActivate: [PermissionUrl],
		// 		loadChildren: () => import('../../views/pages/nguoi-co-cong/quy-den-on-dap-nghia/bao-cao-thu-chi/bao-cao-thu-chi.module').then(m => m.BaoCaoThuChiModule)
		// 	},
			//#endregion 
			//#region Quản lý hỗ trợ nhà ở
			// {
			//  	path: 'ho-tro-nha-o',
			//  	canActivate: [PermissionUrl],
			//  	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/ho-so-nha-o/ho-so-nha-o.module').then(m => m.HoSoNhaOModule)
			// },
			// {
			//  	path: 'duyet-ho-tro-nha',
			//  	canActivate: [PermissionUrl],
			//  	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/ho-so-nha-o-duyet/ho-so-nha-o-duyet.module').then(m => m.HoSoNhaODuyetModule),
			//  	data: { IsEnable_Duyet: false }
			// },
			// {
			//  	path: 'ho-tro-da-duyet',
			//  	canActivate: [PermissionUrl],
			//  	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/ho-so-nha-o-duyet/ho-so-nha-o-duyet.module').then(m => m.HoSoNhaODuyetModule),
			//  	data: { IsEnable_Duyet: true }
			// },
			// {
			// 	path: 'thong-ke-ho-tro',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/thong-ke-ho-tro/thong-ke-ho-tro.module').then(m => m.ThongKeHoTroModule),
		   	// },
			// {
			//  	path: 'thong-ke-kinh-phi',
			//  	canActivate: [PermissionUrl],
			//  	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/thong-ke-kinh-phi/thong-ke-kinh-phi.module').then(m => m.ThongKeKinhPhiModule),
			// },
			// {
			// 	path: 'xuat-da-ho-tro',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/ho-tro-nha-o/xuat-da-ho-tro/xuat-da-ho-tro.module').then(m => m.XuatDaHoTroModule),
		   	// },
			//#endregion
			//#region Bảo hiểm y tế
			// {
			// 	path: 'doi-tuong-bao-hiem',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/doi-tuong-bao-hiem/doi-tuong-bao-hiem.module').then(m => m.DoiTuongBaoHiemModule)
			// },
			// {
			// 	path: 'ql-nhap-bao-hiem',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/nhap-bao-hiem/nhap-bao-hiem.module').then(m => m.NhapBaoHiemModule)
			// },
			// {
			// 	path: 'duyet-bao-hiem',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/nhap-bao-hiem-duyet/nhap-bao-hiem-duyet.module').then(m => m.NhapBaoHiemDuyetModule),
			// 	data: { IsEnable_Duyet: false }
			// },
			// {
			// 	path: 'bao-hiem-da-duyet',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/nhap-bao-hiem-duyet/nhap-bao-hiem-duyet.module').then(m => m.NhapBaoHiemDuyetModule),
			// 	data: { IsEnable_Duyet: true }
			// },
			// {
			// 	path: 'ds-huong-bao-hiem',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/danh-sach-huong-bh/danh-sach-huong-bh.module').then(m => m.DSHuongBaoHiemModule),
		  	// },
			// {
			// 	path: 'tinh-hinh-mua-bh',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/tinh-hinh-mua-bao-hiem/tinh-hinh-mua-bao-hiem.module').then(m => m.TinhHinhBaoHiemModule),
		  	// },
			// {
			// 	path: 'bc-so-luong-bao-hiem',
			// 	canActivate: [PermissionUrl],
			// 	loadChildren: () => import('../../views/pages/nguoi-co-cong/bao-hiem-y-te/so-luong-tong-hop/so-luong-tong-hop.module').then(m => m.SoLuongTongHopModule),
		  	// },
			//#endregion
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					type: 'error-v6',
					code: 403,
					title: '403... Access forbidden',
					desc: 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator',
				},
			},
			{
				path: 'error/404',
				component: ErrorPageComponent,
				data: {
					type: 'error-v6',
					code: 404,
					title: '404... Page Not Found',
					desc: 'This page could not be found on the server.',
				}
			},
			{ path: 'error/:type', component: ErrorPageComponent },
			{ path: '**', redirectTo: 'error/404', pathMatch: 'full' },
		],
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PagesRoutingModule { }