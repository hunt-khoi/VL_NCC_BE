import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { dvDongGopServices } from './Services/dv-dong-gop.service';
import { DVDongGopComponent } from './dv-dong-gop.component';
import { DVDongGopListComponent } from './dv-dong-gop-list/dv-dong-gop-list.component';
import { DPSCommonModule } from '../../dps-common.module';
import { dvDongGopRefModule } from './dv-dong-gop-ref.module';
import { DVDongGopBaoCaoComponent } from './dv-dong-gop-bc/dv-dong-gop-bc.component';

const routes: Routes = [
    {
        path: '',
        component: DVDongGopComponent,
        children: [
            {
                path: '',
                component: DVDongGopListComponent,
            },
            {
                path: 'bao-cao',
                component: DVDongGopBaoCaoComponent,
            },
        ]
    }
];

@NgModule({
    imports: [
		RouterModule.forChild(routes),
        DPSCommonModule,
        dvDongGopRefModule
    ],
	providers: [
        dvDongGopServices,
    ],
	entryComponents: [
		
    ],
    declarations: [
        DVDongGopComponent,
    ]
})
export class DVDongGopModule { }
