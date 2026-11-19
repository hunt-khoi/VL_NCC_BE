import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { PartialsModule } from '../partials/partials.module';
import { CoreModule } from '../../core/core.module';

@NgModule({ imports: [CommonModule,
        FormsModule,
        CoreModule,
        PartialsModule], providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())] })
export class PagesModule { }