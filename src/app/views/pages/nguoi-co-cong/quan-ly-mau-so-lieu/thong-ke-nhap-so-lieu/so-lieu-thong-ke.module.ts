import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThongKeNhapSoLieuService } from './Services/thong-ke-nhap-so-lieu.service';
import { SoLieuThongKeComponent } from './so-lieu-thong-ke.component';
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
    ],
    providers: [
        ThongKeNhapSoLieuService
    ],
    declarations: [
        SoLieuThongKeComponent,
        TongHopComponent,
        TheoGiaiDoanComponent
    ]
})
export class SoLieuThongKeModule { }