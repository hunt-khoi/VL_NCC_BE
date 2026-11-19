import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PartialsModule } from '../../../../partials/partials.module';
import { DPSCommonModule } from '../../dps-common.module';
import { CommonService } from '../../services/common.service';
import { donvihanhchinhService } from './Services/donvihanhchinh.service';
import { donvihanhchinhComponent } from './donvihanhchinh.component';
import { provincesListComponent } from './provinces-list/provinces-list.component';
import { wardListComponent } from './ward-list/ward-list.component';
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

@NgModule({ declarations: [
        donvihanhchinhComponent,
        provincesListComponent,
        wardListComponent,
        KhomApListComponent,
        KhomApEditDialogComponent
    ], imports: [CommonModule,
        PartialsModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        DPSCommonModule], providers: [
        donvihanhchinhService,
        CommonService,
        provideHttpClient(withInterceptorsFromDi())
    ] })

export class DonViHanhChinh_Module { }
