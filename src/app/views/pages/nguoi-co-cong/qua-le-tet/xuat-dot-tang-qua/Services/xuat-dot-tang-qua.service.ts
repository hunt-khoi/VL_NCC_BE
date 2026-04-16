import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_TK = environment.ApiRoot + '/tk-chi-tra';
// const API_district = environment.ApiRoot + '/district';
// const API_ward = environment.ApiRoot + '/dm_wards';

@Injectable()
export class xuatDotTangQuaService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	//API Export 
	exportDSDotQua(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-ds-tang-qua`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	thongKeTheoDotTangQua(queryParams: QueryParamsModel): Observable<any> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/tk-theo-dot-tang-qua`;
		return this.http.get<any>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	//role: 5, nv huyện ko có role này => ko load dc list huyện (lỗi 403)
	// findDataDistrict(queryParams: QueryParamsModel): Observable<QueryResultsModel> {	
	// 	const httpHeaders = this.httpUtils.getHTTPHeaders();
	// 	const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
	// 	const url = API_district + '/ListAll';
	// 	return this.http.get<QueryResultsModel>(url, {
	// 		headers: httpHeaders,
	// 		params: httpParams
	// 	});
	// }

	// findDataWard(queryParams: QueryParamsModel): Observable<QueryResultsModel> {		
	// 	const httpHeaders = this.httpUtils.getHTTPHeaders();
	// 	const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
	// 	const url = API_ward + '/ListAll';
	// 	return this.http.get<QueryResultsModel>(url, {
	// 		headers: httpHeaders,
	// 		params: httpParams
	// 	});
	// }
	
}
