import { DoiTuongBaoHiemService } from './Services/doi-tuong-bao-hiem.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongBaoHiemComponent } from './doi-tuong-bao-hiem.component';
import { DoiTuongBaoHiemRefModule } from './doi-tuong-bao-hiem-ref.module';
import { DoiTuongBaoHiemListComponent } from './doi-tuong-bao-hiem-list/doi-tuong-bao-hiem-list.component';


const routes: Routes = [
	{
		path: '',
		component: DoiTuongBaoHiemComponent,
		children: [
			{
				path: '',
				component: DoiTuongBaoHiemListComponent
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DoiTuongBaoHiemRefModule,	],
	providers: [
		DoiTuongBaoHiemService
	],
	entryComponents: [
	],
	declarations: [
		DoiTuongBaoHiemComponent,
	],
})
export class DoiTuongBaoHiemModule { }
