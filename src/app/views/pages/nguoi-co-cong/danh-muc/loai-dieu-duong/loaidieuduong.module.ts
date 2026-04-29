import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { loaiDieuDuongServices } from './Services/loaidieuduong.service';
import { LoaiDieuDuongComponent } from './loaidieuduong.component';
import { loaiDieuDuongRefModule } from './loaidieuduong-ref.module';
import { LoaiDieuDuongListComponent } from './loai-dieu-duong-list/loaidieuduong-list.component';
import { LoaiDieuDuongEditDialogComponent } from './loai-dieu-duong-edit/loaidieuduong-edit.dialog.component';

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
    declarations: [
        LoaiDieuDuongComponent,
    ]
})

export class LoaiDieuDuongModule { }