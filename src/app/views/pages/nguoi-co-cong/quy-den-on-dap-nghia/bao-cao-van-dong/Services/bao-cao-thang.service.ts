import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_TK = environment.ApiRoot + '/bc-van-dong';

@Injectable()
export class BaoCaoVanDongService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	//API cho thống kê 
	baoCaoVanDongThang(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/thang`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	baoCaoVanDongThoiDiem(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/thoi-diem`;
		return this.http.get<any>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	
	//API Export 
	exportBCVanDongThang(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-thang`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
	exportBCVanDongThoiDiem(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-thoi-diem`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
