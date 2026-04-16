import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { HoTroComponent } from './ho-tro.component';
import { HoTroService } from './Services/ho-tro.service';
import { HoTroRefModule } from './ho-tro-ref.module';
import { HoTroListComponent } from './ho-tro-list/ho-tro-list.component';
import { HoTroPhatComponent } from './ho-tro-phat/ho-tro-phat.component';

const routes: Routes = [
	{
		path: '',
		component: HoTroComponent,
		children: [
			{
				path: '',
				component: HoTroListComponent,
			},
			{
				path: ':id',
				component: HoTroPhatComponent
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		HoTroRefModule,
	],
	providers: [
		HoTroService,
	],
	entryComponents: [
	],
	declarations: [
		HoTroComponent,
		HoTroListComponent,
		HoTroPhatComponent
	]
})
export class HoTroModule { }
