import { NgModule } from '@angular/core';
import { DeXuatTangQuaService } from './Services/de-xuat-tang-qua.service';
import { DPSCommonModule } from '../../dps-common.module';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		DeXuatTangQuaService
	],
	entryComponents: [],
	declarations: [],
	exports:[]
})
export class DeXuatTQRefModule { }
