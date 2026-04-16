import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpUtilsService } from 'app/core/_base/crud/utils/http-utils.service';
import { QueryParamsModel, QueryResultsModel } from 'app/core/_base/crud';
import { SMSHistoryModel } from '../Model/sms-history.model';

const API_ROOT_URL = environment.ApiRoot + '/smshistory';

@Injectable()
export class SMSHistoryService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	getData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParms = this.httpUtils.getFindHTTPParams(queryParams)
		return this.http.post<any>(API_ROOT_URL + '/list', httpParms, { headers: httpHeaders });
	}

	getById(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_ROOT_URL + `/detail?id=${itemId}`, { headers: httpHeaders });
	}

	delete(itemId: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_ROOT_URL}/delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	deletes(ids: any[] = []): Observable<any> {
		const url = API_ROOT_URL + '/Multi_Delete';
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<QueryResultsModel>(url, ids, { headers: httpHeaders });
	}

	create(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<SMSHistoryModel>(API_ROOT_URL + '/create', item, { headers: httpHeaders });
	}

	update(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<SMSHistoryModel>(API_ROOT_URL + '/update', item, { headers: httpHeaders });
	}

	LockNUnLock(itemId: any, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_ROOT_URL}/LockAndUnLock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
}