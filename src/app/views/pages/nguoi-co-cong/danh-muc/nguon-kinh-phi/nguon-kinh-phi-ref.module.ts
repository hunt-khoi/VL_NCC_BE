import { NgModule } from '@angular/core';
import { DPSCommonModule } from '../../dps-common.module';
import { NguonKinhPhiService } from '../nguon-kinh-phi/Services/nguon-kinh-phi.service';
import { NguonKinhPhiListComponent } from './nguon-kinh-phi-list/nguon-kinh-phi-list.component';
import { NguonKinhPhiEditDialogComponent } from './nguon-kinh-phi-edit/nguon-kinh-phi-edit-dialog.component';

@NgModule({
    imports: [
        DPSCommonModule,
    ],
    providers: [
        NguonKinhPhiService,
    ],
    declarations: [
        NguonKinhPhiListComponent,
        NguonKinhPhiEditDialogComponent
    ],
    exports: [NguonKinhPhiListComponent]
})

export class NguonKinhPhiRefModule { }