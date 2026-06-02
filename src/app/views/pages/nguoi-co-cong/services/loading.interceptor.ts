import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	constructor(private loadingService: LoadingService) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		Promise.resolve(null).then(() => this.loadingService.open());
		return next.handle(req).pipe(
			tap(event => {
				if (event instanceof HttpResponse) {
					this.loadingService.close();
				}
			}),
			catchError(error => {
				this.loadingService.close();
				return throwError(error);
			})
		);
	}
}