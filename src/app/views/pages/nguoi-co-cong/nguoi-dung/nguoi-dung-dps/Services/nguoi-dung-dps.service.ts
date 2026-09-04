import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpUtilsService } from 'app/core/_base/crud/utils/http-utils.service';
import { QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';

const API_URL = environment.ApiRoot + '/user-manager';
const API_URL1 = environment.ApiRoot + '/user-rule';

@Injectable()
export class NguoiDungDPSService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	getData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParms = this.httpUtils.getFindHTTPParams(queryParams)
		return this.http.get<any>(API_URL + '/list', { headers: httpHeaders, params: httpParms });

	}
	getById(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL + `/${itemId}`, { headers: httpHeaders });
	}
	delete(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	lock(itemId: any, islock: boolean): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/lock?id=${itemId}&islock=${islock}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	renew(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/renew?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	create(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}
	update(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}
	resetPass(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/reset-password', item, { headers: httpHeaders });
	}
	uploadFile(data: any): Observable<any> {
		const url = API_URL + '/upload';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/import', item, { headers: httpHeaders });
	}
	downloadTemplate(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/dowload-template-import/2`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	exportFile(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/export`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	//#region vai trò
	getVaiTro(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL1}?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	deleteVaiTro(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL1}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	lockVaiTro(itemId: any, islock: boolean): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL1}/lock?id=${itemId}&islock=${islock}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	updateVaiTro(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL1, item, { headers: httpHeaders });
	}
	//#endregion
}