import { DoiTuongTrangCapModel } from '../Model/doi-tuong-trang-cap.model';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/dt-chinh-hinh';

@Injectable()
export class DoiTuongTrangCapService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<DoiTuongTrangCapModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<DoiTuongTrangCapModel[]>(API_URL + '?more=true', { headers: httpHeaders });
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
	CreateDoiTuongTrangCap(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongTrangCap(item: DoiTuongTrangCapModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	importFile(item: any, mau=1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = API_URL + '/import';
		if (mau == 2)
			url = API_URL + '/import2';
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}
	exportList(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get(API_URL + `/export`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
	downloadTemplate(mau=1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/download-template?mau=${mau}`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
