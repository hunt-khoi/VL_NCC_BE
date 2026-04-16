import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';
import { dutoankinhphiModel, dutoankinhphi_NCCModel, DuToanModel, DuToan_DungCuModel } from '../Model/du-toan-kinh-phi.model';

const API_PRODUCTS_URL = environment.ApiRoot + '/du-toan-kinh-phi';

@Injectable()
export class dutoankinhphiService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<dutoankinhphiModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<dutoankinhphiModel[]>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
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
	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}


	// CREATE =>  POST: add a new oduct to the server
	createDuToan(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	updateDuToan(item: DuToanModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	editDungCus(item: DuToan_DungCuModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/edit-du-toan`;
		return this.http.post(url, item, { headers: httpHeaders });
	}

	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = API_PRODUCTS_URL + '/import';
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}

	downloadTemplate(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/download-template`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}