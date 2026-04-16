import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatPaginatorModule, MatPaginatorIntl, MatTooltipModule, MatBadgeModule } from '@angular/material';
import { ThemeService, ChartsModule } from 'ng2-charts';
import { AvatarModule } from "ngx-avatar";
import { CoreModule } from '../../../core/core.module';
import { PartialsModule } from '../../partials/partials.module';
import { DashboardComponent } from './dashboard.component';
import { CommonService } from '../nguoi-co-cong/services/common.service';
import { CustomMatPaginatorIntl } from '../nguoi-co-cong/custom-mat-pagination-int';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';

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
		NgbModule,
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