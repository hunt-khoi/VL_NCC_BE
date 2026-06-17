import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_URL = environment.ApiRoot + '/nhap-so-lieu';

@Injectable()
export class NhapSoLieuDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

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

	detail(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url + "/" + id, { headers: httpHeaders });
	}

	traLai(id: number, note: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/tra-lai?id=${id}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	Duyet(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/duyet`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}

	Duyets(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/duyets`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
}