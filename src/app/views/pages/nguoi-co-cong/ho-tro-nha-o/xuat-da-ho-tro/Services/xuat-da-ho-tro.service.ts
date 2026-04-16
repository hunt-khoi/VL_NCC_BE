import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/xuat-ho-tro';

@Injectable()
export class XuatHoTroNhaService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	//API cho thống kê
	getDanhSach(queryParams: QueryParamsModel): Observable<any> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_PRODUCTS_URL}/get-danh-sach`;
		return this.http.get<any>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	//API Export 
	exportDanhSach(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_PRODUCTS_URL}/export-chi-tiet`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
