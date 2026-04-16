import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpUtilsService } from 'app/core/_base/crud/utils/http-utils.service';
import { QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
const API_filter = environment.ApiRoot + '/filter';

@Injectable()
export class filterService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	Update_filter(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_filter + '/Update', item, { headers: httpHeaders });
	}
	Insert_filter(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_filter + '/Insert', item, { headers: httpHeaders });
	}
	Get_list_filterkey(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_filter}/list_filterkey`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	Delete_filter(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_filter}/Delete?id=${id}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	Detail(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_filter}/detail?id=${id}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_filter+'/List';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

}
