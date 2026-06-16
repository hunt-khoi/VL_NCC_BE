import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { EmailHistoryService } from './Services/email-history.service';
import { EmailHistoryComponent } from './email-history.component';
import { EmailHistoryListComponent } from './email-history-list/email-history-list.component';

const routes: Routes = [
	{
		path: '',
		component: EmailHistoryComponent,
		children: [
			{
				path: '',
				component: EmailHistoryListComponent,
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
		EmailHistoryService
	],
	declarations: [
		EmailHistoryComponent,
		EmailHistoryListComponent,
	]
})

export class EmailHistoryModule {}