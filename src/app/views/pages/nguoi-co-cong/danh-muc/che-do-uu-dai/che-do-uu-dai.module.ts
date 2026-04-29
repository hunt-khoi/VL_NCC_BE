import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { chedouudaiService } from './Services/che-do-uu-dai.service';
import { chedouudaiComponent } from './che-do-uu-dai.component';
import { chedouudaiListComponent } from './che-do-uu-dai-list/che-do-uu-dai-list.component';
import { chedouudaiEditDialogComponent } from './che-do-uu-dai-edit/che-do-uu-dai-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: chedouudaiComponent,
		children: [
			{
				path: '',
				component: chedouudaiListComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		chedouudaiService
	],
	entryComponents: [
		chedouudaiListComponent,
		chedouudaiEditDialogComponent,
	],
	declarations: [
		chedouudaiComponent,
		chedouudaiListComponent,
		chedouudaiEditDialogComponent,
	]
})

export class CheDoUuDaiModule { }