import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { loaiDieuDuongServices } from './Services/loaidieuduong.service';
import { LoaiDieuDuongComponent } from './loaidieuduong.component';
import { LoaiDieuDuongListComponent } from './loai-dieu-duong-list/loaidieuduong-list.component';
import { LoaiDieuDuongEditDialogComponent } from './loai-dieu-duong-edit/loaidieuduong-edit.dialog.component';
import { DPSCommonModule } from '../../dps-common.module';
import { loaiDieuDuongRefModule } from './loaidieuduong-ref.module';
const routes: Routes = [
    {
        path: '',
        component: LoaiDieuDuongComponent,
        children: [
            {
                path: '',
                component: LoaiDieuDuongListComponent,
            },
			{
				path: 'themmoi',
				component: LoaiDieuDuongEditDialogComponent,
			},
        ]
    }
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
        DPSCommonModule,
        loaiDieuDuongRefModule
    ],
	providers: [
        loaiDieuDuongServices,
    ],
	entryComponents: [
		
    ],
    declarations: [
        LoaiDieuDuongComponent,
    ]
})
export class LoaiDieuDuongModule { }
