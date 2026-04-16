import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { TinhHinhTrangCapService } from './Services/tinh-hinh-trang-cap.service';
import { TinhHinhTrangCapComponent } from './tinh-hinh-trang-cap.component';

const routes: Routes = [
	{
		path: '',
		component: TinhHinhTrangCapComponent,
		children: [
			{
				path: '',
				component: TinhHinhTrangCapComponent,
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
		TinhHinhTrangCapService
	],
	entryComponents: [
	],
	declarations: [
		TinhHinhTrangCapComponent,
	]
})
export class TinhHinhTrangCapModule { }
