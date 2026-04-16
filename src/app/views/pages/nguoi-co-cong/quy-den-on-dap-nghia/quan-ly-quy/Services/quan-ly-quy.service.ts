import { QuyDenOnMoDel } from './../Model/dong-gop-quy.model';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/quan-ly-quy';

@Injectable()
export class QuanLyQuyService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	findVanDong(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + '/list-van-dong';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	findLSDongGop(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + '/ls-dong-gop';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	findChiQuy(queryParams: QueryParamsModel, IsChiHoTro: boolean = false): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + (!IsChiHoTro ? '/list-chi-quy' : '/list-chi-hotro');
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	//CREATE CHIQUY
	ChiQuy(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/chi-quy ', item, { headers: httpHeaders });
	}
	ChiHoTro(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/chi-ho-tro', item, { headers: httpHeaders });
	}
	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	deleteChiQuy(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	
	exportChiQuy(queryParams: QueryParamsModel, IsChiHoTro: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get(API_URL + (!IsChiHoTro ? `/export-chi-quy` : `/export-chi-ho-tro`), {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	// CREATE =>  POST: add a new oduct to the server
	DongGopQuy(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/dong-gop', item, { headers: httpHeaders });
	}
	UpdateGopQuy(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/update-dong-gop', item, { headers: httpHeaders });
	}
	ChuyenVaoKeHoach(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL+'/chuyen-dong-gop/' + id, { headers: httpHeaders });
	}

	DeleteDongGop(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/delete-dong-gop/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	UpdateQuy(item: QuyDenOnMoDel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL+'/update-quy', item, { headers: httpHeaders });
	}
	CreateQuy(item: QuyDenOnMoDel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();                                                                                                  
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}
	checkInit(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL+'/check-init', { headers: httpHeaders });
	}
	getChiHoTro(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL+'/get-chi-ht', { headers: httpHeaders });
	}
	getQuyCon(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL+'/get-quy-con', { headers: httpHeaders });
	}
	xuatQDChi(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/xuat-quyet-dinh-chi/${id}`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	export_DGQ_history(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + `/export-ls-dong-gop/`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
	export_DGQ(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + `/export-dong-gop-quy/`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	downloadQD(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_URL + `/download-qd-chi-quy?id=${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

}
