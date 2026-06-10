import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpUtilsService } from '../../_base/crud/utils/http-utils.service';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const API_ROOT_URL = environment.ApiRoot + '/user';

@Injectable()
export class UserProfileService {

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	isPermission(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_ROOT_URL + `/PermissionUrl?currentUrl=${item}`, { headers: httpHeaders })
			.pipe(
				map((res: any) => {
					return res;
				}),
				catchError(err => {
					return throwError(err);
				})
			);
	}
}