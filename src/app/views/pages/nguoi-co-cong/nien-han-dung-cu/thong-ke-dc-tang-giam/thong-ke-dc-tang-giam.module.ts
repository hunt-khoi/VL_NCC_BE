import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DPSCommonModule } from '../../dps-common.module';
import { thongkeDCTangGiamRefModule } from './thong-ke-dc-tang-giam-ref.module';
import { thongkeDCTangGiamComponent } from './thong-ke-dc-tang-giam.component';

const routes: Routes = [
	{
		path: '',
		component: thongkeDCTangGiamComponent,
		// children: [
		// 	{
		// 		path: '',
		// 		component: thongkeQuaCacNamComponent,
		// 	},
		// ]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        thongkeDCTangGiamRefModule,
	],
	providers: [],
	entryComponents: [],
})
export class thongkeTangGiamModule { }
