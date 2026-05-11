import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { dottangquaRefModule } from './dot-tang-qua-ref.module';
import { dottangquaService } from './Services/dot-tang-qua.service';
import { dottangquaComponent } from './dot-tang-qua.component';
import { dottangquaListComponent } from './dot-tang-qua-list/dot-tang-qua-list.component';

const routes: Routes = [
	{
		path: '',
		component: dottangquaComponent,
		children: [
			{
				path: '',
				component: dottangquaListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        dottangquaRefModule,
	],
	providers: [
		dottangquaService
	],
	declarations: [
		dottangquaComponent,
	]
})

export class dottangquaModule { }