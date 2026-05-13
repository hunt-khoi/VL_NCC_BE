import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatTangQuaService } from './Services/de-xuat-tang-qua.service';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		DeXuatTangQuaService
	],
})

export class DeXuatTQRefModule { }