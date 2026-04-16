import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpUtilsService } from '../../_base/crud/utils/http-utils.service';
import { QueryParamsModel } from '../../_base/crud';
import { map, catchError } from 'rxjs/operators';
const API_ROOT_URL = environment.ApiRoot + '/user';

@Injectable()
export class UserProfileService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;
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
			);;
	}
}