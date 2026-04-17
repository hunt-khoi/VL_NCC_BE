import { HoSoNCCEditDialogComponent } from './ho-so-ncc-edit/ho-so-ncc-edit-dialog.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoSoNCCService } from './Services/ho-so-ncc.service';
import { FormDinhChinhComponent } from './ho-so-ncc-edit-page/form-dinh-chinh/form-dinh-chinh.component';
import { FormCatTCComponent } from './ho-so-ncc-edit-page/form-cat-tc/form-cat-tc.component';
import { FormMTPComponent } from './ho-so-ncc-edit-page/form-mtp/form-mtp.component';
import { FormCatTuatComponent } from './ho-so-ncc-edit-page/form-cat-tuat/form-cat-tuat.component';
import { FormTangMoiComponent } from './ho-so-ncc-edit-page/form-tang-moi/form-tang-moi.component';
import { FormTangTuatComponent } from './ho-so-ncc-edit-page/form-tang-tuat/form-tang-tuat.component';
import { FormTangTuatLSComponent } from './ho-so-ncc-edit-page/form-tang-tuat-ls/form-tang-tuat-ls.component';
import { FormTDCComponent } from './ho-so-ncc-edit-page/form-tdc/form-tdc.component';
import { FormTCThangComponent } from './ho-so-ncc-edit-page/form-tc-thang/form-tc-thang.component';
import { FormThoCungComponent } from './ho-so-ncc-edit-page/form-tho-cung/form-tho-cung.component';
import { FormGiayBTComponent } from './ho-so-ncc-edit-page/form-giay-bt/form-giay-bt.component';
import { FormGiayGTComponent } from './ho-so-ncc-edit-page/form-giay-gt/form-giay-gt.component';
import { FormTangMoiBMComponent } from './ho-so-ncc-edit-page/form-tang-moi-bm/form-tang-moi-bm.component';
import { FormDinhChiComponent } from './ho-so-ncc-edit-page/form-dinh-chi/form-dinh-chi.component';
import { FormCatTC_2LietSyComponent } from './ho-so-ncc-edit-page/form-cat-tc-2ls/form-cat-tc-2ls.component';
import { FormDinhChinhLSComponent } from './ho-so-ncc-edit-page/form-dinh-chinh-ls/form-dinh-chinh-ls.component';
import { FormTongHopComponent } from './ho-so-ncc-edit-page/form-tong-hop/form-tong-hop.component';
import { FormDinhChiLSComponent } from './ho-so-ncc-edit-page/form-dinh-chi-ls/form-dinh-chi-ls.component';
import { FormTCThang_TuDayComponent } from './ho-so-ncc-edit-page/form-tc-thang-tuday/form-tc-thang-tuday.component';
import { FormDC_LSComponent } from './ho-so-ncc-edit-page/form-dc-ls/form-dc-ls.component';
import { FormTDC_LSComponent } from './ho-so-ncc-edit-page/form-tdc-ls/form-tdc-ls.component';
import { FormBaseComponent } from './ho-so-ncc-edit-page/form-base.component';

// form base theo loại hs
import { FormDiChuyenComponent } from './ho-so-ncc-edit-page/form-di-chuyen/form-di-chuyen.component';
import { FormTroCap1LanComponent } from './ho-so-ncc-edit-page/form-tro-cap-1lan/form-tro-cap-1lan.component';
import { FormCatTC_MTP_TuatComponent } from './ho-so-ncc-edit-page/form-cat-tc-mtp-tuat/form-cat-tc-mtp-tuat.component';
import { FormCatTC_MTPComponent } from './ho-so-ncc-edit-page/form-cat-tro-cap-mtp/form-cat-tro-cap-mtp.component';
import { FormCatTuatTTComponent } from './ho-so-ncc-edit-page/form-cat-tuat-tutran/form-cat-tuat-tutran.component';

@NgModule({
	imports: [
		RouterModule,
		DPSCommonModule
	],
	providers: [
		HoSoNCCService,
	],
	entryComponents: [
		HoSoNCCEditDialogComponent,
		FormBaseComponent,

		FormCatTCComponent,
		FormCatTC_2LietSyComponent,
		FormCatTC_MTPComponent,
		FormCatTC_MTP_TuatComponent,
		FormCatTuatComponent,
		FormCatTuatTTComponent,

		FormMTPComponent,

		FormTangMoiComponent,
		FormTangMoiBMComponent,
		FormTangTuatComponent,
		FormTangTuatLSComponent,

		FormDC_LSComponent,
		FormDiChuyenComponent,
		FormDinhChinhComponent,
		FormDinhChinhLSComponent,
		FormDinhChiComponent,
		FormDinhChiLSComponent,

		FormTroCap1LanComponent,
		FormTCThangComponent,
		FormTCThang_TuDayComponent,
		FormTDCComponent,
		FormTDC_LSComponent,
		FormThoCungComponent,

		FormGiayBTComponent,
		FormGiayGTComponent,

		FormTongHopComponent
	],
	declarations: [
		HoSoNCCEditDialogComponent,
		FormBaseComponent,

		FormCatTCComponent,
		FormCatTC_2LietSyComponent,
		FormCatTC_MTPComponent,
		FormCatTC_MTP_TuatComponent,
		FormCatTuatComponent,
		FormCatTuatTTComponent,

		FormMTPComponent,

		FormTangMoiComponent,
		FormTangMoiBMComponent,
		FormTangTuatComponent,
		FormTangTuatLSComponent,

		FormTroCap1LanComponent,
		FormTCThangComponent,
		FormTCThang_TuDayComponent,
		FormTDCComponent,
		FormTDC_LSComponent,
		FormThoCungComponent,

		FormDC_LSComponent,
		FormDiChuyenComponent,
		FormDinhChinhComponent,
		FormDinhChinhLSComponent,
		FormDinhChiComponent,
		FormDinhChiLSComponent,

		FormGiayBTComponent,
		FormGiayGTComponent,

		FormTongHopComponent
	],
})

export class HoSoNCCRefModule { }