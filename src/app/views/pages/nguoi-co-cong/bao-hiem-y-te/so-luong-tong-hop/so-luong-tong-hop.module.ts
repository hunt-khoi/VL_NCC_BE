import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { SoLuongTongHopRefModule } from './so-luong-tong-hop-ref.module';
import { SoLuongTongHopTabComponent } from './so-luong-tong-hop-tab.component';
import { SoLuongTongHopComponent } from './so-luong-tong-hop.component';

const routes: Routes = [
	{
		path: '',
		component: SoLuongTongHopComponent,
		children: [
			{
				path: '',
				component: SoLuongTongHopTabComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        SoLuongTongHopRefModule,
	],
	providers: [
		
	],
	entryComponents: [
	],
	declarations: [
		SoLuongTongHopComponent,
	]
})
export class SoLuongTongHopModule { }
