import { Type } from '@angular/core';
import { FormDinhChinhComponent } from './form-dinh-chinh/form-dinh-chinh.component';
import { FormCatTCComponent } from './form-cat-tc/form-cat-tc.component';
import { FormMTPComponent } from './form-mtp/form-mtp.component';
import { FormCatTuatComponent } from './form-cat-tuat/form-cat-tuat.component';
import { FormTangMoiComponent } from './form-tang-moi/form-tang-moi.component';
import { FormTangTuatLSComponent } from './form-tang-tuat-ls/form-tang-tuat-ls.component';
import { FormTangTuatComponent } from './form-tang-tuat/form-tang-tuat.component';
import { FormTCThangComponent } from './form-tc-thang/form-tc-thang.component';
import { FormTDCComponent } from './form-tdc/form-tdc.component';
import { FormThoCungComponent } from './form-tho-cung/form-tho-cung.component';
import { FormGiayBTComponent } from './form-giay-bt/form-giay-bt.component';
import { FormGiayGTComponent } from './form-giay-gt/form-giay-gt.component';
import { FormTangMoiBMComponent } from './form-tang-moi-bm/form-tang-moi-bm.component';
import { FormDinhChiComponent } from './form-dinh-chi/form-dinh-chi.component';
import { FormCatTC_2LietSyComponent } from './form-cat-tc-2ls/form-cat-tc-2ls.component';
import { FormDinhChinhLSComponent } from './form-dinh-chinh-ls/form-dinh-chinh-ls.component';
import { FormDinhChiLSComponent } from './form-dinh-chi-ls/form-dinh-chi-ls.component';
import { FormTCThang_TuDayComponent } from './form-tc-thang-tuday/form-tc-thang-tuday.component';
import { FormDC_LSComponent } from './form-dc-ls/form-dc-ls.component';
import { FormTDC_LSComponent } from './form-tdc-ls/form-tdc-ls.component';
import { FormDiChuyenComponent } from './form-di-chuyen/form-di-chuyen.component';
import { FormTroCap1LanComponent } from './form-tro-cap-1lan/form-tro-cap-1lan.component';
import { FormCatTC_MTP_TuatComponent } from './form-cat-tc-mtp-tuat/form-cat-tc-mtp-tuat.component';
import { FormCatTC_MTPComponent } from './form-cat-tro-cap-mtp/form-cat-tro-cap-mtp.component';
import { FormCatTuatTTComponent } from './form-cat-tuat-tutran/form-cat-tuat-tutran.component';

export const COMPONENT_MAPPING: { [key: string]: Type<any> } = {
	'1_1': FormCatTCComponent, 			// 1: Cắt trợ cấp (Đối tượng 1: Bà mẹ VNAH)
	'2_all': FormCatTC_MTPComponent, 		// 2: Cắt trợ cấp + mtp
	'3_all': FormCatTC_MTP_TuatComponent, 	// 3: Cắt trợ cấp + mai táng phí + tuất x
	'4_5': FormCatTuatComponent, 			// 4: Cắt tuất tái giá x (Đối tượng 5: Liệt sĩ)
	'8_all': FormDiChuyenComponent, 		// 8: Di chuyển
	'10_all': FormDinhChinhComponent, 		// 10: Đính chính
	'11_5': FormGiayBTComponent, 			// 11: Giấy báo tử (Đối tượng 5: Liệt sĩ)
	'12_all': FormGiayGTComponent, 		// 12: Giấy giới thiệu x
	'13_all': FormMTPComponent, 			// 13: Mai táng phí các đối tượng hưởng trợ cấp 1 lần và cựu chiến binh x
	'14_all': FormTDCComponent, 			// 14: Tạm đình chỉ
	'15_all': FormTangMoiComponent, 		// 15: Tăng mới
	'17_all': FormTangTuatComponent, 		// 17: Tăng tuất
	'18_5': FormTangTuatLSComponent, 		// 18: Tăng tuất liệt sỹ (Đối tượng 5: Liệt sĩ)
	'19_5': FormThoCungComponent, 			// 19: Thờ cúng (Đối tượng 5: Liệt sĩ)
	'20_1': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 1: BMVNAH)
	'20_4': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 4: Trước 1/1/45)
	'20_9': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 9: Kháng chiến bảo vệ Tổ quốc)
	'20_13': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 13: QĐ 53)
	'20_18': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 18: Tiền khởi nghĩa)
	'20_22': FormTroCap1LanComponent, 		// 20: Trợ cấp 1 lần (Đối tượng 22)
	'21_23': FormTCThangComponent, 		// 21: Trợ cấp hàng tháng (Đối tượng 23)
	'22_all': FormDinhChinhLSComponent, 	// 22: Đính chính thông tin hồ sơ liệt sỹ
	'23_1': FormCatTC_2LietSyComponent, 	// 23: Cắt trợ cấp trên 2 liệt sỹ (Đối tượng 1: Bà mẹ)
	'24_1': FormTangMoiBMComponent, 		// 24: Tăng mới BM VNAH (Đối tượng 1)
	'25_all': FormDinhChiComponent, 		// 25: Đình chỉ (id đối tượng: 18, 4, 1, 21, 17, 25, 28, 2, 26, 29, 3, 27, 30, 9, 22, 23, 19)
	'28_5': FormDinhChiLSComponent, 		// 28: Đình chỉ thờ cúng liệt sỹ (Đối tượng 5: Liệt sĩ)
	'29_5': FormTDC_LSComponent, 			// 29: Tạm đình chỉ thờ cúng liệt sỹ (Đối tượng 5: Liệt sĩ)
	'30_all': FormTroCap1LanComponent, 	// 30: Trợ cấp 1 lần thân nhân
	'31_5': FormDC_LSComponent, 			// 31: Di chuyển liệt sĩ (Đối tượng 5: Liệt sĩ)
	'32_all': FormCatTuatTTComponent, 		// 32: Cắt tuất từ trần (id đối tượng: 2, 3, 4, 18, 17)
	'33_all': FormTroCap1LanComponent, 	// 33: Trợ cấp 1 lần
	'34_all': FormTroCap1LanComponent, 	// 34: Trợ cấp 1 lần
	'35_all': FormTroCap1LanComponent, 	// 35: Trợ cấp 1 lần
	'36_all': FormTroCap1LanComponent, 	// 36: Trợ cấp 1 lần
	'37_all': FormTroCap1LanComponent, 	// 37: Trợ cấp 1 lần
	'38_all': FormTroCap1LanComponent, 	// 38: Trợ cấp 1 lần
	'39_19': FormTCThang_TuDayComponent, 	// 39: Trợ cấp hàng tháng (Đối tượng 19: Tù đày)
	'40_all': FormTroCap1LanComponent, 	// 40: Trợ cấp 1 lần
	'41_all': FormTroCap1LanComponent, 	// 41: Trợ cấp 1 lần
	'42_3': FormTangMoiComponent 			// 42: Tăng mới chất độc hóa học (Đối tượng 3: CDHH)
};
