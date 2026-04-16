import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/ncc';

@Injectable()
export class HoSoNCCDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'CreatedDate', 0, 10));
	lastFilterHD$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'ngay_tao', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url + "/list-duyet", {
			headers: httpHeaders,
			params: httpParams
		});
	}
	detail(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_URL;
		return this.http.get<any>(url + "/" + id, { headers: httpHeaders });
	}
	traLai(id, note) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/tra-lai?id=${id}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	Duyet(data) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/duyet`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	Duyets(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/duyets`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}

	DeXuatDuyet(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/dexuatduyet`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	getFiles(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<any>(API_URL + "/get-files", {
			headers: httpHeaders,
			params: httpParams
		});
	}


	//#region hướng dẫn
	findDataHD(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_URL + "/list-huong-dan", {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getDetailHuongDan(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/get-detail-huong-dan?id_quatrinh_lichsu=${id}`, {
			headers: httpHeaders,
		});
	}
	updateHuongDan(data): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_URL + `/update-huong-dan`, data, {
			headers: httpHeaders,
		});
	}
	exportListHS_DaDuyet(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get(API_URL + `/export-hs-da-duyet`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
