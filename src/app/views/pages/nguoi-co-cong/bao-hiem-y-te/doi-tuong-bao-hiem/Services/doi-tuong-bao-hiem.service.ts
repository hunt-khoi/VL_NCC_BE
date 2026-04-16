import { DoiTuongBaoHiemModel } from './../Model/doi-tuong-bao-hiem.model';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/doi-tuong-bao-hiem';

@Injectable()
export class DoiTuongBaoHiemService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<DoiTuongBaoHiemModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<DoiTuongBaoHiemModel[]>(API_URL + '?more=true', { headers: httpHeaders });
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
	CreateDoiTuongBaoHiem(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongBaoHiem(item: DoiTuongBaoHiemModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = API_URL + '/import';
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
	downloadTemplate(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/download-template`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	downAllFiles(htno: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/download-all-files?id=${htno}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
