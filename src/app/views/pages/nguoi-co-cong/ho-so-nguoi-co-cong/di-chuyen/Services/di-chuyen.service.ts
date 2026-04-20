import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/di-chuyen';
const API_QD = environment.ApiRoot + '/quyet-dinh';

@Injectable()
export class DiChuyenService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getAllItems(): Observable<any[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any[]>(API_URL + '?more=true', { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_URL, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getNCC(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${environment.ApiRoot}/ncc/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	Create(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	Update(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	Delete(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	Duyet(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/duyet', item, { headers: httpHeaders });
	}

	previewDN(iddc: number, idncc: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-don-de-nghi?iddc=${iddc}&idncc=${idncc}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}

	exportDN(iddc: number, idncc: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/export-don-de-nghi?iddc=${iddc}&idncc=${idncc}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	//#region Quyết định
	previewQD(ncc: number, itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_QD}/get-phieu-bao?id=${ncc}&qd=${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}

	exportQD(ncc: number, itemId: number, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_QD}/export-phieu-bao?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
		});
	}

	downloadQD(ncc: number, itemId: number, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_QD}/download-quyet-dinh-dc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
		});
	}

	getQDDC(ncc: number, itemId: number, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_QD}/download-quyet-dinh-dc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}
	//#endregion
}