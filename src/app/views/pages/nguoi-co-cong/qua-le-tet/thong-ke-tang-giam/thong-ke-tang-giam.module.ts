import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import { thongkeTangGiamRefModule } from './thong-ke-tang-giam-ref.module';
import { thongkeComponent } from './thong-ke-tang-giam.component';
import { thongkeQuaCacNamComponent } from './tk-qua-cac-nam/tk-qua-cac-nam.component';

const routes: Routes = [
	{
		path: '',
		component: thongkeComponent,
		children: [
			{
				path: '',
				component: thongkeQuaCacNamComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        thongkeTangGiamRefModule,
	],
	providers: [
		dottangquaService
	],
	entryComponents: [ ],
	declarations: [
		thongkeComponent,
	]
})
export class thongkeTangGiamModule { }
