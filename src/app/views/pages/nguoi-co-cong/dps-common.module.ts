// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
// Translate Module
import { TranslateModule } from '@ngx-translate/core';
// UI
import { PartialsModule } from '../../../views/partials/partials.module';
// Core => Utils
import {
	HttpUtilsService,
	TypesUtilsService,
	InterceptService,
	LayoutUtilsService
} from '../../../core/_base/crud';

import { NgxPermissionsModule } from 'ngx-permissions';
import { NgbProgressbarModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

//Datetime format
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MY_FORMATS_EDIT } from './datepicker';

import { LibModule } from '../../partials/lib/lib.module';

//Share
import { ActionNotificationComponent, DeleteEntityDialogComponent, AlertComponent } from '../../partials/content/crud';
import { CommonService } from './services/common.service';
import { CustomMatPaginatorIntl } from './custom-mat-pagination-int';
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxPrintModule } from 'ngx-print';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { TableService } from '../../partials/table/table.service';
import { ColumnFilterComponent, ColumnOptionComponent, ChipFilterComponent } from '../../partials/table';
import {
	ChonDonViComponent,
	ChonNhieuDonViComponent,
	ChonVaiTroComponent,
	TreeDonViNodeComponent,
	TreeDonViComponent,
	TreeDonViDialogComponent,
	ListFileDinhKemComponent,
	ChonNhieuNhanVienListComponent,
	CommentComponent,
	CommentEditDialogComponent,
	EmotionDialogComponent,
	ChooseUsersComponent,
	ReviewExportComponent,
	ReviewDocxComponent,
	DisplayHtmlContentComponent,
	ChonNhieuDoiTuongListComponent,
	SettingProcessComponent,
	LoadingComponent,
	TroCapEditComponent,
	QuyetDinhEditComponent,
	QuaTrinhHoatDongEditComponent,
	NguoiDungDonViComponent,
	DiChuyenEditComponent,
	ThanNhanEditComponent,
	TroCapRowEditComponent,
	DCThanNhanRowEditComponent,
	ChonNhieuBieuMauListComponent,
	CanCuLSRowEditComponent,
	ToTrinhEditComponent
} from './components';
import { PopoverModule } from 'ngx-smart-popover';
import { CommentService } from './components/comment/comment.service';
import { DynamicProcessService } from './services/dynamic-process.service';
import { RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AvatarModule } from'ngx-avatar';
import { LoadingService } from './services/loading.service';
import { LoadingInterceptor } from './services/loading.interceptor';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EditorModule } from '@tinymce/tinymce-angular';
import { QuyetDinhBaseEditComponent } from './components/quyet-dinh-base-edit/quyet-dinh-base-edit.component';
import { MonthFormatDirective } from './services/month-format.directive';
import { CookieService } from 'ngx-cookie-service';
import { CanvasDemoModule } from './components/canvas-demo/canvas-demo.module';
import { ChartsModule } from 'ng2-charts';
import { CKEditorModule } from 'ckeditor4-angular';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

@NgModule({
    imports: [
        RouterModule,
        NgbModule,
        MatDialogModule,
        CommonModule,
        HttpClientModule,
        PartialsModule,
        NgxPermissionsModule.forChild(),
        NgxMatSelectSearchModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild(),
        MatButtonModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        MatTableModule,
        MatAutocompleteModule,
        MatRadioModule,
        MatIconModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatCardModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,
        NgbProgressbarModule,
        MatChipsModule,
        MatListModule,
        DragDropModule,
        ScrollingModule,
        CdkTableModule,
        CdkTreeModule,
        LibModule,
        MatTreeModule,
        MatExpansionModule,
        NgxPrintModule,
        MatToolbarModule,
        MatCardModule,
        PopoverModule,
        NgxMaskModule.forRoot(),
        //NgIdleKeepaliveModule.forRoot(),
        AngularEditorModule,
        EditorModule,
        AvatarModule,
        CanvasDemoModule,
        ChartsModule,
        CKEditorModule
    ],
    providers: [
        InterceptService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptService,
            multi: true
        },
        {
            provide: MAT_DIALOG_DEFAULT_OPTIONS,
            useValue: {
                hasBackdrop: true,
                panelClass: 'kt-mat-dialog-container__wrapper',
                height: 'auto',
                width: '70%'
            }
        },
        TypesUtilsService,
        LayoutUtilsService,
        HttpUtilsService,
        { provide: MAT_DATE_LOCALE, useValue: 'vi' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_EDIT },
        {
            provide: MatPaginatorIntl,
            useClass: CustomMatPaginatorIntl
        },
        CookieService,
        CommonService,
        TableService,
        CommentService,
        DynamicProcessService,
        LoadingService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        }
    ],
    declarations: [
        ColumnFilterComponent,
        ColumnOptionComponent,
        ChipFilterComponent,
        ChonDonViComponent,
        ChonNhieuDonViComponent,
        ChonVaiTroComponent,
        TreeDonViNodeComponent,
        TreeDonViComponent,
        TreeDonViDialogComponent,
        ListFileDinhKemComponent,
        ChonNhieuNhanVienListComponent,
        ChonNhieuDoiTuongListComponent,
        CommentComponent,
        CommentEditDialogComponent,
        EmotionDialogComponent,
        ChooseUsersComponent,
        ReviewExportComponent,
        ReviewDocxComponent,
        DisplayHtmlContentComponent,
        SettingProcessComponent,
        LoadingComponent,
        TroCapEditComponent,
        QuyetDinhEditComponent,
        QuyetDinhBaseEditComponent,
        QuaTrinhHoatDongEditComponent,
        NguoiDungDonViComponent,
        DiChuyenEditComponent,
        ThanNhanEditComponent,
        TroCapRowEditComponent,
        DCThanNhanRowEditComponent,
        CanCuLSRowEditComponent,
        ChonNhieuBieuMauListComponent,
        ToTrinhEditComponent,
        MonthFormatDirective,
    ],
    exports: [
        RouterModule,
        NgbModule,
        MatDialogModule,
        CommonModule,
        HttpClientModule,
        PartialsModule,
        NgxPermissionsModule,
        NgxMatSelectSearchModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        MatButtonModule,
        MatMenuModule,
        MatSelectModule,
        MatInputModule,
        MatTableModule,
        MatAutocompleteModule,
        MatRadioModule,
        MatIconModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatCardModule,
        MatPaginatorModule,
        MatSortModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTabsModule,
        MatTooltipModule,
        NgbProgressbarModule,
        MatChipsModule,
        MatListModule,
        DragDropModule,
        ScrollingModule,
        CdkTableModule,
        CdkTreeModule,
        LibModule,
        MatTreeModule,
        MatExpansionModule,
        NgxPrintModule,
        PopoverModule,
        NgxMaskModule,
        AngularEditorModule,
        AvatarModule,
        ChartsModule,
        CKEditorModule,
        ActionNotificationComponent,
        DeleteEntityDialogComponent,
        AlertComponent,
        ColumnFilterComponent,
        ColumnOptionComponent,
        ChipFilterComponent,
        ChonDonViComponent,
        ChonNhieuDonViComponent,
        ChonVaiTroComponent,
        TreeDonViNodeComponent,
        TreeDonViComponent,
        TreeDonViDialogComponent,
        ListFileDinhKemComponent,
        ChonNhieuNhanVienListComponent,
        ChonNhieuDoiTuongListComponent,
        CommentComponent,
        CommentEditDialogComponent,
        EmotionDialogComponent,
        ChooseUsersComponent,
        ReviewExportComponent,
        ReviewDocxComponent,
        LoadingComponent,
        TroCapEditComponent,
        QuyetDinhEditComponent,
        QuyetDinhBaseEditComponent,
        QuaTrinhHoatDongEditComponent,
        NguoiDungDonViComponent,
        DiChuyenEditComponent,
        ThanNhanEditComponent,
        TroCapRowEditComponent,
        DCThanNhanRowEditComponent,
        CanCuLSRowEditComponent,
        ToTrinhEditComponent,
        MonthFormatDirective
    ]
})
export class DPSCommonModule { }