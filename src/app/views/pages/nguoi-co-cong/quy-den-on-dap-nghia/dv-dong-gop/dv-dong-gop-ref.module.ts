import { NgModule } from '@angular/core';
import { ThemeService } from 'ng2-charts';
import { DVDongGopListComponent } from './dv-dong-gop-list/dv-dong-gop-list.component';
import { dvDongGopServices } from './Services/dv-dong-gop.service';
import { DPSCommonModule } from '../../dps-common.module';
import { DVDongGopEditDialogComponent } from './dv-dong-gop-edit/dv-dong-gop-edit.dialog.component';
import { dvDongGopImportComponent } from './dv-dong-gop-import/dv-dong-gop-import.component';
import { DVDongGopBaoCaoComponent } from './dv-dong-gop-bc/dv-dong-gop-bc.component';

@NgModule({
	imports: [
		DPSCommonModule,
	],
	providers: [
		dvDongGopServices,
		ThemeService
	],
	entryComponents: [
		DVDongGopListComponent,
		DVDongGopEditDialogComponent,
		dvDongGopImportComponent
	],
	declarations: [
		DVDongGopListComponent,
		DVDongGopBaoCaoComponent,
		DVDongGopEditDialogComponent,
		dvDongGopImportComponent
	],
	exports:[
		DVDongGopListComponent,
		dvDongGopImportComponent
	]
})
export class dvDongGopRefModule { }
