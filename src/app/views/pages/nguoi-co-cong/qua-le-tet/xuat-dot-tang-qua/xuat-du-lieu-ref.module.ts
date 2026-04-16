import { NgModule } from '@angular/core';

import { DPSCommonModule } from '../../dps-common.module';
import { xuatDotTangQuaService } from './Services/xuat-dot-tang-qua.service';
import { xuatDotTangQuaComponent } from './xuat-dot-tang-qua/xuat-dot-tang-qua.component';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		xuatDotTangQuaService
	],
	entryComponents: [
		xuatDotTangQuaComponent,

	],
	declarations: [
		xuatDotTangQuaComponent,
	],
	exports:[
		xuatDotTangQuaComponent,
	]
})
export class xuatDuLieuRefModule { }
