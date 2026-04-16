import { PartialsModule } from './../../../../partials/partials.module';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DPSCommonModule } from '../../dps-common.module';
import { CanCuBieuMauComponent } from './can-cu-bieu-mau.component';
import { CanCuService } from './services/can-cu.service';
import { BieuMauService } from './services/bieu-mau.service';
import { CanCuListComponent } from './can-cu-list/can-cu-list.component';
import { CanCuEditDialogComponent } from './can-cu-edit/can-cu-edit.dialog.component';
import { BieuMauListComponent } from './bieu-mau-list/bieu-mau-list.component';
import { BieuMauEditDialogComponent } from './bieu-mau-edit/bieu-mau-edit.dialog.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { KeyWordListComponent } from './key-word-list/key-word-list.component';
import { KeyWordListDialogComponent } from './key-word-list-dialog/key-word-list-dialog.component';
import { BieuMauQuaEditDialogComponent } from './bieu-mau-qua-edit/bieu-mau-qua-edit.dialog.component';
import { BieuMauQuaListComponent } from './bieu-mau-qua-list/bieu-mau-qua-list.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { BieuMauQuaService } from './services/bieu-mau-qua.service';
import { BieuMauThanhPhanEditDialogComponent } from './bieu-mau-thanh-phan-edit/bieu-mau-thanh-phan-edit-dialog.component';
import { BieuMauThanhPhanListComponent } from './bieu-mau-thanh-phan-list/bieu-mau-thanh-phan-list.component';
const routes: Routes = [
	{
		path: '',
		component: CanCuBieuMauComponent,
		children: [
			{
				path: '',
				component: CanCuBieuMauComponent,
			},
		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		PartialsModule,
		RouterModule.forChild(routes),
		FormsModule,
		ReactiveFormsModule,
		DPSCommonModule,
		AngularEditorModule,
		EditorModule
	],
	providers: [
		CanCuService,
		BieuMauService,
		BieuMauQuaService,
		{ provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
	],
	entryComponents: [
		CanCuEditDialogComponent,
		BieuMauEditDialogComponent,
		BieuMauQuaEditDialogComponent,
		KeyWordListComponent,
		KeyWordListDialogComponent,
		BieuMauThanhPhanEditDialogComponent,
		BieuMauThanhPhanListComponent
	],
	declarations: [
		CanCuBieuMauComponent,
		CanCuListComponent,
		CanCuEditDialogComponent,
		BieuMauListComponent,
		BieuMauEditDialogComponent,
		BieuMauQuaListComponent,
		BieuMauQuaEditDialogComponent,
		KeyWordListComponent,
		KeyWordListDialogComponent,
		BieuMauThanhPhanEditDialogComponent,
		BieuMauThanhPhanListComponent
	],
	exports: [
	]
})
export class CanCuBieuMauModule { }
