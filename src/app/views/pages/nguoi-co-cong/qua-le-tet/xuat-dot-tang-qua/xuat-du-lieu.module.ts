import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { xuatDotTangQuaService } from './Services/xuat-dot-tang-qua.service';
import { xuatDuLieuRefModule } from './xuat-du-lieu-ref.module';
import { xuatDuLieuComponent } from './xuat-du-lieu.component';
import { xuatDotTangQuaComponent } from './xuat-dot-tang-qua/xuat-dot-tang-qua.component';

const routes: Routes = [
	{
		path: '',
		component: xuatDuLieuComponent,
		children: [
			{
				path: '',
				component: xuatDotTangQuaComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        xuatDuLieuRefModule,
	],
	providers: [
		xuatDotTangQuaService
	],
	declarations: [
		xuatDuLieuComponent,
	]
})

export class xuatDuLieuModule { }