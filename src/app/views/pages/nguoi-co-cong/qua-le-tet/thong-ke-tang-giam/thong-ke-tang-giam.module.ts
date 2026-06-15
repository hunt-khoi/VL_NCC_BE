import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { dottangquaService } from '../dot-tang-qua/Services/dot-tang-qua.service';
import { thongkeComponent } from './thong-ke-tang-giam.component';

const routes: Routes = [
	{
		path: '',
		component: thongkeComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		dottangquaService
	],
	declarations: [
		thongkeComponent,
	]
})

export class thongkeTangGiamModule { }