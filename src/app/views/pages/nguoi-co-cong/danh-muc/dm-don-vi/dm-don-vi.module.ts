// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//Component
import { DM_DonViComponent } from './dm-don-vi.component';
import { DM_DonViListComponent } from './dm-don-vi-list/dm-don-vi-list.component';
import { DM_DonViEditComponent } from './dm-don-vi-edit/dm-don-vi-edit.component';
import { DM_DonViImportComponent } from './dm-don-vi-import/dm-don-vi-import.component';
import { DmNguoiDungDonViListComponent } from './dm-nguoi-dung-don-vi-list/dm-nguoi-dung-don-vi-list.component';
//Service
import { DM_DonViService } from './Services/dm-don-vi.service';
import { DPSCommonModule } from '../../dps-common.module';

const routes: Routes = [
	{
		path: '',
		component: DM_DonViComponent,
		children: [
			{
				path: '',
				component: DM_DonViComponent,
			}
		]
	}
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
		DPSCommonModule,
	],
	providers: [
		DM_DonViService
	],
	entryComponents: [
		DM_DonViEditComponent,
		DM_DonViImportComponent
	],
	declarations: [
		DM_DonViComponent,
		DM_DonViListComponent,
		DM_DonViEditComponent,
		DM_DonViImportComponent,
		DmNguoiDungDonViListComponent
	]
})
export class DM_DonViModule {}
