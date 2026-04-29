import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryResultsModel, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_provinces = environment.ApiRoot + '/provinces';
const API_ward = environment.ApiRoot + '/dm_wards';
const API_KhomAp = environment.ApiRoot + '/dm-khom-ap';

@Injectable()
export class donvihanhchinhService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterXa$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterKhomAp$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	findDataProvinces(queryParams: QueryParamsModel): Observable<QueryResultsModel> {		
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_provinces + '/ListAll';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	findDataWard(queryParams: QueryParamsModel): Observable<QueryResultsModel> {		
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_ward + '/ListAll';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	findDataKhomAp(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_KhomAp + '/ListAll';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	CreateKhomAp(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_KhomAp + '/Insert', item, { headers: httpHeaders });
	}

	UpdateKhomAp(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_KhomAp + '/Update', item, { headers: httpHeaders });
	}

	DeleteKhomAp(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_KhomAp}/Delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
}