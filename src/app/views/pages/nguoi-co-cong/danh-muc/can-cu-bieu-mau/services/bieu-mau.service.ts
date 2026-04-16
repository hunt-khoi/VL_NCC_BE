import { QueryResultsModel } from './../../../../../../core/_base/crud/models/query-models/query-results.model';
import { QueryParamsModel } from './../../../../../../core/_base/crud/models/query-models/query-params.model';
import { environment } from './../../../../../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpUtilsService } from './../../../../../../core/_base/crud/utils/http-utils.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API_URL = environment.ApiRoot + '/bieu-mau';
@Injectable({
	providedIn: 'root'
})
export class BieuMauService {

	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<QueryResultsModel>(API_URL, { headers: httpHeaders });
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

	Delete(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	ListKey(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/keys`, { headers: httpHeaders });
	}

	getKey(keyword): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/keys?keyword=` + keyword;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	previewByTemplate(mau): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${environment.ApiRoot}/quyet-dinh/get-by-template?id_template=${mau}&ncc=0`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}
	exportByTemplate(mau, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${environment.ApiRoot}/quyet-dinh/export-by-template?id_template=${mau}&ncc=0&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	download(mau): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${environment.ApiRoot}/bieu-mau/download/${mau}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	//#region mẫu thành phần

	findDataTP(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = environment.ApiRoot + '/bieu-mau-tp';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItemTP(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${environment.ApiRoot}/bieu-mau-tp/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateItemTP(item): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(environment.ApiRoot + `/bieu-mau-tp/${item.Id}`, item, { headers: httpHeaders });
	}
	downloadTP(mau, isfail:boolean=false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${environment.ApiRoot}/bieu-mau-tp/download/${mau}?isfail=${isfail}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	//#endregion
}
