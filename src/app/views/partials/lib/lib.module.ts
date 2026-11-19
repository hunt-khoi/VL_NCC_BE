import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbLiteModule } from './ngb/ngb-lite.module';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatNativeDateModule } from '@angular/material/core';
import { FileUploadModule } from 'ng2-file-upload';

import { DropdownTreeComponent } from './dropdown-tree/dropdown-tree.component';
import { ImageControlComponent } from './image-control/image-control.component';
import { DatetimePickerComponent } from './datetime-picker/datetime-picker.component';
import { DynamicComponentComponent, InsertionDirective } from './dynamic-component/dynamic-component.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

@NgModule({
    declarations: [
        DropdownTreeComponent,
        ImageControlComponent,
        DatetimePickerComponent,
        DynamicComponentComponent,
        InsertionDirective,
        DynamicFormComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        NgbLiteModule,
        CdkTreeModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatButtonModule,
        MatMenuModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatRadioModule,
        MatIconModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatNativeDateModule,
        FileUploadModule
    ],
    exports: [
        DropdownTreeComponent,
        ImageControlComponent,
        DatetimePickerComponent,
        DynamicComponentComponent,
        DynamicFormComponent
    ],
    providers: [
        DatePipe
    ]
})

export class LibModule { }