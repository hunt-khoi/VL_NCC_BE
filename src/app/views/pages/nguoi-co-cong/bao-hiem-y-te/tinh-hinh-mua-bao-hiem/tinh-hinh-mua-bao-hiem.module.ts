import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { TinhHinhMuaBaoHiemService } from './Services/tinh-hinh-mua-bao-hiem.service';
import { TinhHinhBaoHiemComponent } from './tinh-hinh-mua-bao-hiem.component';

const routes: Routes = [
	{
		path: '',
		component: TinhHinhBaoHiemComponent,
		children: [
			{
				path: '',
				component: TinhHinhBaoHiemComponent,
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
		TinhHinhMuaBaoHiemService
	],
	entryComponents: [
	],
	declarations: [
		TinhHinhBaoHiemComponent
	]
})
export class TinhHinhBaoHiemModule { }
