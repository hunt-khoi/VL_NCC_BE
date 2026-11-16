import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NhapNienHanService } from './Services/nhap-nien-han.service';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		NhapNienHanService
	],
	declarations: [],
})
export class NhapNienHanRefModule { }
