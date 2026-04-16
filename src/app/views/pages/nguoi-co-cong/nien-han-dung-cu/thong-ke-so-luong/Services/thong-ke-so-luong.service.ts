import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_TK = environment.ApiRoot + '/so-luong';

@Injectable()
export class ThongKeSoLuongService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	//API cho thống kê 
	thongKeTheoDoiTuong(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/tk-theo-doi-tuong`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	thongKeDenNienHan(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/tk-den-nien-han`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	thongKeTheoDungCu(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/tk-theo-dung-cu`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	baoCaoTongHop(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/tk-bc-tong-hop`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	
	//API Export 
	exportTKDoiTuong(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-tk-theo-doi-tuong`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportTKDungCu(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-tk-theo-dung-cu`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportBCTongHop(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-bc-tong-hop`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportTKDenNienHan(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-tk-nien-han`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
