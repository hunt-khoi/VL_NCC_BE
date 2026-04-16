import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PartialsModule } from '../partials/partials.module';
import { CoreModule } from '../../core/core.module';

@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		FormsModule,
		CoreModule,
		PartialsModule,
	],
})
export class PagesModule { }