import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpUtilsService, QueryParamsModel, QueryResultsModel } from '../../../../core/_base/crud';
import { environment } from '../../../../../environments/environment';

const API_URL = environment.ApiRoot + '/notify';

@Injectable()
export class NotifyService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_URL + "/get-dashboard", {
			headers: httpHeaders,
			params: httpParams
		});
	}

	markAsRead(isDelete = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL + '/markAsRead/' + isDelete, { headers: httpHeaders });
	}

	delete(Id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.delete<any>(API_URL + '/' + Id, { headers: httpHeaders });
	}

	deletes(data: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/deletes', data, { headers: httpHeaders });
	}
}