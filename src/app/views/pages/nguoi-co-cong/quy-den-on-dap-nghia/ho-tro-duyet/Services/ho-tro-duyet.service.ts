import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/ho-tro';

@Injectable()
export class HoTroDTDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'CreatedDate', 0, 10));
	ReadOnlyControl: boolean;
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

	getFiles(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<any>(API_URL + "/get-files", {
			headers: httpHeaders,
			params: httpParams
		});
	}

	hoTroDoiTuong(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + "/add-ho-tro", item, { headers: httpHeaders });
	}
}
