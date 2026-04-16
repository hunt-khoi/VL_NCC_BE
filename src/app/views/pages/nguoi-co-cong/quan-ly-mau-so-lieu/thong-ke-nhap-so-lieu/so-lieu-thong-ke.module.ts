import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { SoLieuThongKeRefModule } from './so-lieu-thong-ke-ref.module';
import { SoLieuThongKeComponent } from './so-lieu-thong-ke.component';
import { ThongKeNhapSoLieuService } from './Services/thong-ke-nhap-so-lieu.service';
import { TongHopComponent } from './tong-hop/tong-hop.component';
import { TheoGiaiDoanComponent } from './theo-giai-doan/theo-giai-doan.component';

const routes: Routes = [
	{
		path: '',
		component: SoLieuThongKeComponent,
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		SoLieuThongKeRefModule,
	],
	providers: [
		ThongKeNhapSoLieuService
	],
	entryComponents: [
	],
	declarations: [
		SoLieuThongKeComponent,
		TongHopComponent,
		TheoGiaiDoanComponent
	]
})
export class SoLieuThongKeModule { }
