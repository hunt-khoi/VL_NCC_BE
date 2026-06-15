import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { DeXuatRefModule } from '../de-xuat/de-xuat-ref.module';
import { DeXuatDuyetService } from './Services/de-xuat-duyet.service';
import { DeXuatDuyetListComponent } from './de-xuat-duyet-list/de-xuat-duyet-list.component';
import { DeXuatDuyetDialogComponent } from './de-xuat-duyet/de-xuat-duyet.dialog.component';

@NgModule({
    imports: [
        DPSCommonModule,
        DeXuatRefModule
    ],
    providers: [
        DeXuatDuyetService
    ],
    declarations: [
        DeXuatDuyetListComponent,
        DeXuatDuyetDialogComponent,
    ],
    exports: [
        DeXuatDuyetListComponent,
    ]
})

export class DeXuatDuyetRefModule { }