import { MucQuaService } from './Services/muc-qua.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { MucQuaEditDialogComponent } from './muc-qua-edit/muc-qua-edit-dialog.component';
import { MucQuaListComponent } from './muc-qua-list/muc-qua-list.component';
import { MucQuaRefModule } from './muc-qua-ref.module';
import { MucQuaComponent } from './muc-qua.component';


const routes: Routes = [
	{
		path: '',
		component: MucQuaComponent,
		children: [
			{
				path: '',
				component: MucQuaListComponent,
			},
			{
				path: 'themmoi',
				component: MucQuaEditDialogComponent,
			},
			{
				path: 'chinhsua/:id',
				component: MucQuaEditDialogComponent,
			},
		]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
		MucQuaRefModule,
	],
	providers: [
		MucQuaService
	],
	entryComponents: [
	],
	declarations: [
		MucQuaComponent
	]
})
export class MucQuaModule { }
