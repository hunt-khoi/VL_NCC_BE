import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/tk-ncc';

@Injectable()
export class ThongKeSoLuongService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	findData(filter: any): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(filter);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url+'/so-luong', {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getDetail(filter: any): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		// const httpParams = this.httpUtils.parseFilter(filter);
		const httpParams = this.httpUtils.getFindHTTPParams(filter);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url+'/so-luong-detail-ds', {
			headers: httpHeaders,
			params: httpParams
		});
	}
	
	exportListDetail(filter: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(filter);
		return this.http.get(API_URL + `/export-so-luong-detail-ds`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportList(filter: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(filter);
		return this.http.get(API_URL + `/export-so-luong`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}