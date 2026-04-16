// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
// Service
import { ConfigComponent } from './config.component';
import { ConfigListComponent } from './config-list/config-list.component';
import { ConfigEditComponent } from './config-edit/config-edit.component';
import { ConfigService } from './Services/config.service';

const routes: Routes = [
	{
		path: '',
		component: ConfigComponent,
		children: [
			{
				path: '',
				component: ConfigListComponent,
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
		ConfigService
	],
	entryComponents: [
		ConfigEditComponent
	],
	declarations: [
		ConfigComponent,
		ConfigListComponent,
		ConfigEditComponent
	]
})
export class ConfigModule {}
