import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanSoLieuService } from './Services/thoi-han-so-lieu.service';
import { ThoiHanSoLieuComponent } from './thoi-han-so-lieu.component';
import { ThoiHanSoLieuListComponent } from './thoi-han-so-lieu-list/thoi-han-so-lieu-list.component';
import { NhapSoLieuRefModule } from '../nhap-so-lieu/nhap-so-lieu-ref.module';

const routes: Routes = [
	{
		path: '',
		component: ThoiHanSoLieuComponent,
		children: [
			{
				path: '',
				component: ThoiHanSoLieuListComponent,
			}
		]
	}
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        DPSCommonModule,
        NhapSoLieuRefModule,
    ],
    providers: [
        ThoiHanSoLieuService,
    ],
    declarations: [
        ThoiHanSoLieuComponent,
        ThoiHanSoLieuListComponent,
    ]
})

export class ThoiHanSoLieuModule { }
