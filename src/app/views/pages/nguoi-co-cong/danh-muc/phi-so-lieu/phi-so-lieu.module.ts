import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PhiSoLieuComponent } from './phi-so-lieu.component';
import { PhiSoLieuListComponent } from './phi-so-lieu-list/phi-so-lieu-list.component';
import { PhiSoLieuDialogComponent } from './phi-so-lieu-edit/phi-so-lieu-edit.dialog.component';
import { DPSCommonModule } from '../../dps-common.module';
import { PhiSoLieuRefModule } from './phi-so-lieu-ref.module';
import { PhiSoLieuServices } from './Services/phi-so-lieu.service';
const routes: Routes = [
    {
        path: '',
        component: PhiSoLieuComponent,
        children: [
            {
                path: '',
                component: PhiSoLieuListComponent,
            },
            {
                path: 'themmoi',
                component: PhiSoLieuDialogComponent,
            },
        ]
    }
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
        DPSCommonModule,
        PhiSoLieuRefModule
    ],
	providers: [
        PhiSoLieuServices,
    ],
	entryComponents: [
		
    ],
    declarations: [
        PhiSoLieuComponent,
    ]
})
export class LoaiGiayToModule { }
