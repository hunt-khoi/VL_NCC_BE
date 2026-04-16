import { HoSoNhaOModel } from './../Model/ho-so-nha-o.model';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/doi-tuong-nha-o';

@Injectable()
export class HoSoNhaOService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<HoSoNhaOModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<HoSoNhaOModel[]>(API_URL + '?more=true', { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	CreateHoSoNCC(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateHoSoNCC(item: HoSoNhaOModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}


	hoTroNhaO(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + "/add-ho-tro", item, { headers: httpHeaders });
	}
	hoTroNhaOs(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + "/ho-tros", item, { headers: httpHeaders });
	}
	getHoTro(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-ho-tro/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	UpdateHoTro(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/update-ho-tro/${item.Id}`, item, { headers: httpHeaders });
	}

	deleteHoTro(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/delete-ho-tro/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	Lock(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// Gửi duyệt
	GuiDuyet(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/gui-duyet?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	GuiDuyets(data: number[]): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/gui-duyet`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}

	// Thu hồi
	ThuHoi(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/thu-hoi?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	ThuHois(data: number[]): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/thu-hoi`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}
	Duyets(data: any) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/duyets`;
		return this.http.post<any>(url, data, { headers: httpHeaders });
	}

	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/import', item, { headers: httpHeaders });
	}
	exportList(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get(API_URL + `/export`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
	downloadTemplate(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_URL + `/download-template`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	downAllFiles(htno: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/download-all-files?id=${htno}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	exportCTHoTro(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_URL}/export-chi-tiet-ho-tro/` + itemId;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
