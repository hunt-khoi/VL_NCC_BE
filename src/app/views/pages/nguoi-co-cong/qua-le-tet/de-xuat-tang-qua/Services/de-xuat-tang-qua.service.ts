import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/de-xuat-dot-tang';

@Injectable()
export class DeXuatTangQuaService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getAllItems(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getNCC(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-ncc?idot=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	create(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}
}