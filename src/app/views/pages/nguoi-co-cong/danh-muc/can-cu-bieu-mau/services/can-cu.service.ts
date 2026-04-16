import { QueryResultsModel } from './../../../../../../core/_base/crud/models/query-models/query-results.model';
import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { environment } from './../../../../../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpUtilsService } from './../../../../../../core/_base/crud/utils/http-utils.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API_URL = environment.ApiRoot + '/can-cu';
@Injectable({
	providedIn: 'root'
})
export class CanCuService {

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<QueryResultsModel>(API_URL+"?more=true", { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	CreateItem(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateItem(item): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}
	Delete(Id:number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.delete(API_URL + `/${Id}`, { headers: httpHeaders });
	}
}
