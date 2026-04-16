// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
// Service
import { SMSHistoryComponent } from './sms-history.component';
import { SMSHistoryListComponent } from './sms-history-list/sms-history-list.component';
import { SMSHistoryEditComponent } from './sms-history-edit/sms-history-edit.component';
import { SMSHistoryService } from './Services/sms-history.service';

const routes: Routes = [
	{
		path: '',
		component: SMSHistoryComponent,
		children: [
			{
				path: '',
				component: SMSHistoryListComponent,
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
		SMSHistoryService
	],
	entryComponents: [
		SMSHistoryEditComponent
	],
	declarations: [
		SMSHistoryComponent,
		SMSHistoryListComponent,
		SMSHistoryEditComponent
	]
})
export class SMSHistoryModule {}
