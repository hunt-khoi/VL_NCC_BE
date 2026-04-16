import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { districtModel, provincesModel, wardModel } from '../Model/donvihanhchinh.model';
import { QueryResultsModel, QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_district = environment.ApiRoot + '/district';
const API_provinces = environment.ApiRoot + '/provinces';
const API_ward = environment.ApiRoot + '/dm_wards';
const API_KhomAp = environment.ApiRoot + '/dm-khom-ap';
@Injectable()
export class donvihanhchinhService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterHuyen$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterXa$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterKhomAp$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }
	CreateDistrict(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_district + '/Insert', item, { headers: httpHeaders });
	}
	findDataDistrict(queryParams: QueryParamsModel): Observable<QueryResultsModel> {		
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_district + '/ListAll';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
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
	// UPDATE => PUT: update the product on the server
	UpdateDistrict(item: districtModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_district + '/Update', item, { headers: httpHeaders });
	}
	// DELETE => delete the product from the server
	deleteDistrict(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_district}/Delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}	
	// CREATE =>  POST: add a new oduct to the server
	CreateProvinces(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_provinces + '/Insert', item, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the product on the server
	UpdateProvinces(item: provincesModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_provinces + '/Update', item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteProvinces(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_provinces}/Delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	Createward(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_ward + '/Insert', item, { headers: httpHeaders });
	}
	UpdateWard(item: wardModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_ward + '/Update', item, { headers: httpHeaders });
	}
	deleteWard(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_ward}/Delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	//#region khóm ấp
	findDataKhomAp(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_KhomAp + '/ListAll';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	CreateKhomAp(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_KhomAp + '/Insert', item, { headers: httpHeaders });
	}
	UpdateKhomAp(item: wardModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_KhomAp + '/Update', item, { headers: httpHeaders });
	}
	deleteKhomAp(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_KhomAp}/Delete?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	//#endregion
}

