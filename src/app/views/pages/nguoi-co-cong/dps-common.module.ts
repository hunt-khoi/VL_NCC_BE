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
import { NgbLiteModule } from '../../partials/lib/ngb/ngb-lite.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Material
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule, MAT_LEGACY_DIALOG_DEFAULT_OPTIONS as MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorModule as MatPaginatorModule, MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

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
import { PopoverModule } from '../../partials/lib/popover/popover';
import { CommentService } from './components/comment/comment.service';
import { DynamicProcessService } from './services/dynamic-process.service';
import { RouterModule } from '@angular/router';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AvatarModule } from 'ngx-avatars';
import { LoadingService } from './services/loading.service';
import { LoadingInterceptor } from './services/loading.interceptor';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EditorModule } from '@tinymce/tinymce-angular';
import { QuyetDinhBaseEditComponent } from './components/quyet-dinh-base-edit/quyet-dinh-base-edit.component';
import { MonthFormatDirective } from './services/month-format.directive';
import { CookieService } from 'ngx-cookie-service';
import { CanvasDemoModule } from './components/canvas-demo/canvas-demo.module';
import { ChartsModule } from '../../partials/lib/ng2-charts';
import { CKEditorModule } from 'ckeditor4-angular';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

@NgModule({
    imports: [
        RouterModule,
        NgbLiteModule,
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
        NgbLiteModule,
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
        NgbLiteModule,
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
        NgbLiteModule,
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