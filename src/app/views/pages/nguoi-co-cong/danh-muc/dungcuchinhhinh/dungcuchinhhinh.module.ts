import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { dungcuchinhhinhComponent } from './dungcuchinhhinh.component';
import { dungcuchinhhinhService } from './Services/dungcuchinhhinh.service';
import { dungcuchinhhinhRefModule } from './dungcuchinhhinh-ref.module';
import { dungcuchinhhinhListComponent } from './dungcuchinhhinh-list/dungcuchinhhinh-list.component';

const routes: Routes = [
	{
		path: '',
		component: dungcuchinhhinhComponent,
		children: [
			{
				path: '',
				component: dungcuchinhhinhListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
        dungcuchinhhinhRefModule,
	],
	providers: [
		dungcuchinhhinhService
	],
	declarations: [
		dungcuchinhhinhComponent,
	]
})

export class dungcuchinhhinhModule { }