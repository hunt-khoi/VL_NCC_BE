import { DoiTuongNhanQuaService } from './Services/doi-tuong-nhan-qua.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { DoiTuongNhanQuaComponent } from './doi-tuong-nhan-qua.component';
import { DoiTuongNhanQuaRefModule } from './doi-tuong-nhan-qua-ref.module';
import { DoiTuongNhanQuaListComponent } from './doi-tuong-nhan-qua-list/doi-tuong-nhan-qua-list.component';


const routes: Routes = [
	{
		path: '',
		component: DoiTuongNhanQuaComponent,
		children: [
			{
				path: '',
				component: DoiTuongNhanQuaListComponent
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		DoiTuongNhanQuaRefModule,	],
	providers: [
		DoiTuongNhanQuaService
	],
	entryComponents: [
	],
	declarations: [
		DoiTuongNhanQuaComponent,
	],
})
export class DoiTuongNhanQuaModule { }
