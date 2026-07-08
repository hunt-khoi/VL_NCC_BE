import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { ThoiHanService } from './Services/thoi-han.service';
import { ThoiHanComponent } from './thoi-han.component';
import { ThoiHanListComponent } from './thoi-han-list/thoi-han-list.component';

const routes: Routes = [
	{
		path: '',
		component: ThoiHanComponent,
		children: [
			{
				path: '',
				component: ThoiHanListComponent,
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
        ThoiHanService,
    ],
    declarations: [
        ThoiHanComponent,
        ThoiHanListComponent,
    ]
})

export class ThoiHanModule { }