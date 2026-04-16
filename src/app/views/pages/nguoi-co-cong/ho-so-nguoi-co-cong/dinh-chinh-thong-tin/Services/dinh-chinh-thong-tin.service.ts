import { QueryResultsModel } from './../../../../../../core/_base/crud/models/query-models/query-results.model';
import { HttpUtilsService } from './../../../../../../core/_base/crud/utils/http-utils.service';
import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from './../../../../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_URL = environment.ApiRoot + '/dinh-chinh';

@Injectable()
export class DinhChinhThongTinService {
  lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	GetListField(): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<QueryResultsModel>(API_URL+'/GetListField', { headers: httpHeaders });
  	}
  
	getAllItems(): Observable<any[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any[]>(API_URL + '?more=true', { headers: httpHeaders });
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

	getNCC(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${environment.ApiRoot}/ncc/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	Create(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}
	Approved(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/Approved', item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	Duyet(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/duyet', item, { headers: httpHeaders });
	}
	PrintDinhChinh(iddc): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-dinh-chinh?id=${iddc}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}
	exportDinhChinh(iddc, idncc: number, loai:number=1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/export-don-dinh-chinh?iddc=${iddc}&idncc=${idncc}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
