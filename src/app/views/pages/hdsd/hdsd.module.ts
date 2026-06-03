import { HDSDService } from './Services/hdsd.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../nguoi-co-cong/dps-common.module';
import { HDSDComponent } from './hdsd.component';
import { HDSDListComponent } from './hdsd-list/hdsd-list.component';
import { HDSDEditDialogComponent } from './hdsd-edit/hdsd-edit.dialog.component';

const routes: Routes = [
	{
		path: '',
		component: HDSDComponent,
		children: [
			{
				path: '',
				component: HDSDListComponent,
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
        HDSDService
    ],
    declarations: [
        HDSDComponent,
        HDSDListComponent,
        HDSDEditDialogComponent
    ]
})

export class HDSDModule { }