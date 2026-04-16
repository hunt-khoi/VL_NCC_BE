// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
//Service
import { LogComponent } from './log.component';
import { LogListComponent } from './log-list/log-list.component';
import { LogService } from './Services/log.service';
import { FileListComponent } from './file-list/file-list.component';

const routes: Routes = [
	{
		path: '',
		component: LogComponent,
		children: [
			{
				path: '',
				component: LogListComponent,
			},
			{
				path: 'doi-tuong/:loai/:id',
				component: LogListComponent,
			},
		]
	}
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	providers: [
		LogService
	],
	declarations: [
		LogComponent,
		LogListComponent,
		FileListComponent
	]
})
export class LogModule { }