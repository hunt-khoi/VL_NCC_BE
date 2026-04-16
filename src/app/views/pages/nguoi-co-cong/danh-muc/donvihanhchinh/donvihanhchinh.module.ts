import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { donvihanhchinhService } from './Services/donvihanhchinh.service';
import { donvihanhchinhComponent } from './donvihanhchinh.component';
import { provincesListComponent } from './provinces-list/provinces-list.component';
import { provincesEditDialogComponent } from './provinces-edit/provinces-edit.dialog.component';
import { districtEditDialogComponent } from './district-edit/district-edit.dialog.component';
import { districtListComponent } from './district-list/district-list.component';
import { wardListComponent } from './ward-list/ward-list.component';
import { wardEditDialogComponent } from './ward-edit/ward-edit.dialog.component';
import { DPSCommonModule } from '../../dps-common.module';
import { PartialsModule } from '../../../../partials/partials.module';
import { CommonService } from '../../services/common.service';
import { KhomApListComponent } from './khom-ap-list/khom-ap-list.component';
import { KhomApEditDialogComponent } from './khom-ap-edit/khom-ap-edit.dialog.component';
const routes: Routes = [
    {
        path: '',
        component: donvihanhchinhComponent,
        children: [
            {
                path: '',
                component: donvihanhchinhComponent,
            }
        ]
    }
];

@NgModule({
    imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
		DPSCommonModule
    ],
	providers: [
		donvihanhchinhService,
		CommonService
    ],
	entryComponents: [
		districtEditDialogComponent,
		provincesEditDialogComponent,
		wardEditDialogComponent,
		KhomApEditDialogComponent
    ],
    declarations: [
        donvihanhchinhComponent,
        provincesListComponent,
		districtListComponent,
		districtEditDialogComponent,
		provincesEditDialogComponent,
		wardListComponent,
		wardEditDialogComponent,
		KhomApListComponent,
		KhomApEditDialogComponent
    ]
})
export class DonViHanhChinh_Module { }
