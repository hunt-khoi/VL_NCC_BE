import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
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
        NgbModule,
        NgbProgressbarModule,
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