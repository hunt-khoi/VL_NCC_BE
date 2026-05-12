import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { xuatDotTangQuaService } from './Services/xuat-dot-tang-qua.service';
import { xuatDotTangQuaComponent } from './xuat-dot-tang-qua.component';

const routes: Routes = [
	{
		path: '',
		component: xuatDotTangQuaComponent,
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
	],
	providers: [
		xuatDotTangQuaService
	],
	declarations: [
		xuatDotTangQuaComponent,
	]
})

export class xuatDuLieuModule { }