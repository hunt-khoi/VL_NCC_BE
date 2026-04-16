import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../dps-common.module';
import { FileViewerComponent } from './file-viewer.component';
import { AuthGuard } from '../../../../core/auth';

const routes: Routes = [
	{
		path: 'file-dinh-kem/:id',
		component: FileViewerComponent,
		canActivate: [AuthGuard]
	}
];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		DPSCommonModule
	],
	declarations: [
		FileViewerComponent
	]
})
export class FileViewerModule { }