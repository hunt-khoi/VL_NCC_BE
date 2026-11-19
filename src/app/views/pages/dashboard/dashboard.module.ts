import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbLiteModule } from '../../partials/lib/ngb/ngb-lite.module';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyPaginatorModule as MatPaginatorModule, MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ThemeService, ChartsModule } from '../../partials/lib/ng2-charts';
import { AvatarModule } from 'ngx-avatars';
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { CommonService } from '../nguoi-co-cong/services/common.service';
import { CustomMatPaginatorIntl } from '../nguoi-co-cong/custom-mat-pagination-int';
import { PerfectScrollbarModule } from '../../partials/lib/perfect-scrollbar/perfect-scrollbar';

@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		MatPaginatorModule,
		CoreModule,
		MatTooltipModule,
		MatBadgeModule,
		PerfectScrollbarModule,
		AvatarModule,
		NgbLiteModule,
		ChartsModule,
		RouterModule.forChild([
			{
				path: '',
				component: DashboardComponent
			},
		]),
	],
	providers: [CommonService,
		ThemeService,
		{
			provide: MatPaginatorIntl,
			useClass: CustomMatPaginatorIntl
		}],
	declarations: [
		DashboardComponent
	],	
})

export class DashboardModule { }