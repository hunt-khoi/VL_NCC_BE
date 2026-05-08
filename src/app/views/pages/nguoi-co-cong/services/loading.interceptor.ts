import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	constructor(private loadingService: LoadingService) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		Promise.resolve(null).then(() => this.loadingService.open());
		return next.handle(req).do(event => {
			if (event instanceof HttpResponse) {
				this.loadingService.close();
			}
		}).catch(error => {
			this.loadingService.close();
			return Observable.throw(error);
		});
	}
}