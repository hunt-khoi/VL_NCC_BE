import { dantocService } from './Services/dantoc.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { dantocEditDialogComponent } from './dantoc-edit/dantoc-edit.dialog.component';
import { dantocListComponent } from './dantoc-list/dantoc-list.component';
import { dantocComponent } from './dantoc.component';


const routes: Routes = [
	{
		path: '',
		component: dantocComponent,
		children: [
			{
				path: '',
				component: dantocListComponent,
			}
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		dantocService
	],
	entryComponents: [
		dantocEditDialogComponent
	],
	declarations: [
		dantocComponent,
		dantocListComponent,
		dantocEditDialogComponent
	]
})
export class dantocModule { }
