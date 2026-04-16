import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/nhap-nien-han';

@Injectable()
export class NienHanDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel, istonghop: boolean = false, isxa: boolean = false): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = API_PRODUCTS_URL;
		if (isxa) { //load niên hạn xã tạo cần duyệt
			url += istonghop ? "/list-th-xa" : "/list-duyet-xa"
		} 
		else {
			url += istonghop ? "/list-th-huyen" : "/list-duyet-huyen"
		}
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItem(itemId: number, isGiam = false, isxa = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}?isGiam=` + isGiam + `&isxa=`  + isxa;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	//API cho phần duyệt
	traLai(id, note, isxa = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/tra-lai?id=${id}&note=${note}&isxa=${isxa}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getRange(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-range`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
		
	duyetNienHan(data, isxa: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyet?isxa=`+isxa;
		return this.http.post<any>(url, data, { headers: httpHeaders });

		//value=true là duyệt, value=false là không duyệt
	}
	Duyets(data: any, isxa: boolean = false) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyets?isxa=`+isxa;
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
	exportExcelNienHan(id, isxa=false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-excel-nien-han?id=` + id + `&isxa=`  + isxa;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

}
