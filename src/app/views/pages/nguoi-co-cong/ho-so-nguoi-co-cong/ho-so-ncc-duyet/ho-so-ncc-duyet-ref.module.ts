import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DPSCommonModule } from '../../dps-common.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HoSoNCCDuyetService } from './Services/ho-so-ncc-duyet.service';
import { HoSoNCCDuyetDialogComponent } from './ho-so-ncc-duyet/ho-so-ncc-duyet-dialog.component';
import { HoSoNCCDuyetListComponent } from './ho-so-ncc-duyet-list/ho-so-ncc-duyet-list.component';
import { HuongDanListComponent } from './huong-dan-list/huong-dan-list.component';
import { HuongDanHuongThienDialogComponent } from './huong-dan-hoan-thien/huong-dan-hoan-thien-dialog.component';

@NgModule({
    imports: [
        RouterModule,
        DPSCommonModule,
        AngularEditorModule
    ],
    providers: [
        HoSoNCCDuyetService,
    ],
    declarations: [
        HoSoNCCDuyetListComponent,
        HoSoNCCDuyetDialogComponent,
        HuongDanHuongThienDialogComponent,
        HuongDanListComponent
    ],
    exports: [HoSoNCCDuyetListComponent]
})

export class HoSoNCCDuyetRefModule { }