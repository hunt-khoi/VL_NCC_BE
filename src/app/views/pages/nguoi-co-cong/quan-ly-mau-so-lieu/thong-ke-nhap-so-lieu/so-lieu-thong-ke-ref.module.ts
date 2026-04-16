import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeNhapSoLieuService } from './Services/thong-ke-nhap-so-lieu.service';

@NgModule({
	imports: [
		DPSCommonModule
	],
	providers: [
		ThongKeNhapSoLieuService
	],
})
export class SoLieuThongKeRefModule { }
