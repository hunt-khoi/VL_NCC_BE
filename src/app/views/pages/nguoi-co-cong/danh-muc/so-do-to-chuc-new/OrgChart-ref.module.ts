import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DndModule } from 'ngx-drag-drop';
import { DPSCommonModule } from '../../dps-common.module';
import { OrgChartService } from './Services/so-do-to-chuc.service';
import { chucvuService } from '../chucvu/Services/chucvu.service';
import { sodotochuceditComponent } from './so-do-to-chuc-edit/so-do-to-chuc-edit.component';
import { DrawListComponent } from './draw-chart/draw-chart-list.component';
import { SodotochucListComponent } from './so-do-to-chuc-new-list/so-do-to-chuc-new-list.component';

@NgModule({
    declarations: [
        SodotochucListComponent,
        sodotochuceditComponent,
        DrawListComponent
    ],
    imports: [
        RouterModule,
        DPSCommonModule,
        DndModule
    ],
    providers: [
        [
            OrgChartService,
            chucvuService,
        ],
    ],
    exports: [
        SodotochucListComponent
    ]
})

export class OrgChartRefNewModule { }