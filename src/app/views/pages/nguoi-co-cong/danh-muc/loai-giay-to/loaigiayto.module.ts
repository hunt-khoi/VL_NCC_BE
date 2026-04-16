import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { loaiGiayToServices } from './Services/loaigiayto.service';
import { LoaiGiayToComponent } from './loaigiayto.component';
import { LoaiGiayToListComponent } from './loaigiayto-list/loaigiayto-list.component';
import { LoaiGiayToEditDialogComponent } from './loaigiayto-edit/loaigiayto-edit.dialog.component';
import { DPSCommonModule } from '../../dps-common.module';
import { loaiGiayToRefModule } from './loaigiayto-ref.module';
const routes: Routes = [
    {
        path: '',
        component: LoaiGiayToComponent,
        children: [
            {
                path: '',
                component: LoaiGiayToListComponent,
            },
            {
                path: 'themmoi',
                component: LoaiGiayToEditDialogComponent,
            },
        ]
    }
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
        DPSCommonModule,
        loaiGiayToRefModule
    ],
	providers: [
        loaiGiayToServices,
    ],
	entryComponents: [
		
    ],
    declarations: [
        LoaiGiayToComponent,
    ]
})
export class LoaiGiayToModule { }
