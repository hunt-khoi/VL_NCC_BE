import { HoSoNCCService } from './../../ho-so-nguoi-co-cong/ho-so-ncc/Services/ho-so-ncc.service';
import { DanhmuckhacDetailComponent } from './danhmuckhac-detail/danhmuckhac-detail.component';
import { PartialsModule } from './../../../../partials/partials.module';
import { DanhMucKhacListComponent } from './danh-muc-khac-list/danh-muc-khac-list.component';
import { DanhMucKhacComponent } from './danh-muc-khac.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DanhMucKhacService } from './services/danh-muc-khac.service';
import { DanhMucLoaiTroCapComponent } from './danh-muc-loai-tro-cap/danh-muc-loai-tro-cap.component';
import { TroCapDetailComponent } from './tro-cap-detail/tro-cap-detail.component';
import { TroCapImportComponent } from './tro-cap-import/tro-cap-import.component';
import { LoaiQuyetDinhListComponent } from './loai-quyet-dinh-list/loai-quyet-dinh-list.component';
import { LoaiQuyetDinhDetailComponent } from './loai-quyet-dinh-detail/loai-quyet-dinh-detail.component';
import { LoaiQuyetDinhService } from './services/loai-quyet-dinh.service';
import { NoiDungChiListComponent } from './noi-dung-chi-list/noi-dung-chi-list.component';
import { NoiDungChiDetailComponent } from './noi-dung-chi-detail/noi-dung-chi-detail.component';
import { NoiDungChiService } from './services/noi-dung-chi.service';
const routes: Routes = [
    {
        path: '',
        component: DanhMucKhacComponent,
        children: [
            {
                path: '',
                component: DanhMucKhacListComponent,
            },
			// {
			// 	path: 'themmoi',
			// 	component: LoaiDieuDuongEditDialogComponent,
			// },
        ]
    }
];


@NgModule({
    imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
        DPSCommonModule,
    ],
	providers: [
        DanhMucKhacService,
		HoSoNCCService,
		LoaiQuyetDinhService,
        NoiDungChiService
    ],
	entryComponents: [
		DanhmuckhacDetailComponent,
        TroCapDetailComponent,
		TroCapImportComponent,
		LoaiQuyetDinhDetailComponent,
        NoiDungChiDetailComponent
    ],
    declarations: [
        DanhMucKhacComponent,
        DanhMucKhacListComponent,
        DanhmuckhacDetailComponent,
        DanhMucLoaiTroCapComponent,
		TroCapDetailComponent,
		TroCapImportComponent,
		LoaiQuyetDinhListComponent,
		LoaiQuyetDinhDetailComponent,
        NoiDungChiListComponent,
        NoiDungChiDetailComponent
    ],
	exports: [
    ]
})
export class DanhMucKhacModule { }
