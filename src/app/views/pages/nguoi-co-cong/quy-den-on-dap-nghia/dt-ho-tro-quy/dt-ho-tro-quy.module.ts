import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { dtHoTroServices } from './Services/dt-ho-tro-quy.service';
import { DPSCommonModule } from '../../dps-common.module';
import { dtHoTroRefModule } from './dt-ho-tro-quy-ref.module';
import { DTHoTroComponent } from './dt-ho-tro-quy.component';
import { DTHoTroTabComponent } from './dt-ho-tro-quy-tab.component';

const routes: Routes = [
    {
        path: '',
        component: DTHoTroComponent,
        children: [
            {
                path: '',
                component: DTHoTroTabComponent,
            },
        ]
    }
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
        DPSCommonModule,
        dtHoTroRefModule
    ],
	providers: [
        dtHoTroServices,
    ],
	entryComponents: [
		
    ],
    declarations: [
        DTHoTroComponent,
    ]
})
export class DTHoTroModule { }
