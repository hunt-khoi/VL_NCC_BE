import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/de-xuat';

@Injectable()
export class DeXuatDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel, cap: number = 3): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = API_PRODUCTS_URL;
		if (cap == 1)
			url += "/list-duyet-tinh";
		if (cap == 2)
			url += "/list-duyet-huyen";
		if (cap == 3)
			url += "/list-duyet";
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItem(itemId: number, isGiam = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}?isGiam=` + isGiam;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	//API cho phần duyệt
	traLai(id, note): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/tra-lai?id=${id}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
		
	duyetDotTangQua(data): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyet`;
		return this.http.post<any>(url, data, { headers: httpHeaders });

		//value=true là duyệt, value=false là không duyệt
	}
	Duyets(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyets`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	tongHopDeXuatDot(filter): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(filter);
		return this.http.get(API_PRODUCTS_URL + `/tong-hop-de-xuat-dot`, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	nhacNho(data: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/nhac-nho`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	exportExcelDeXuat(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-excel-de-xuat?id=` + id;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
