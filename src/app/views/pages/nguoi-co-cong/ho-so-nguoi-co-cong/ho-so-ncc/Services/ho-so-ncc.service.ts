import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { HoSoNCCModel } from './../Model/ho-so-ncc.model';

const API_URL = environment.ApiRoot + '/ncc';

@Injectable()
export class HoSoNCCService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<HoSoNCCModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<HoSoNCCModel[]>(API_URL + '?more=true', { headers: httpHeaders });
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
	UpdateHoSoNCC(item: HoSoNCCModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
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
	reviewFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + '/import', item, { headers: httpHeaders });
	}

	GetTemplateByNCC(ncc): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-mau-theo-ncc?Id=${ncc}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
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

	previewHS(id, queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(queryParams);
		return this.http.get(API_URL + `/get-ho-so?id=${id}`, {
			headers: httpHeaders,
			params: httpParams,
		});
	}

	previewHS1(id, queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(queryParams);
		return this.http.get(API_URL + `/get-ho-so-tu-loai-hs?id=${id}`, {
			headers: httpHeaders,
			params: httpParams,
		});
	}

	exportHS(id, queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(queryParams);
		return this.http.get(API_URL + `/export-ho-so?id=${id}`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	downloadHS(id, queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(queryParams);
		return this.http.get(API_URL + `/download-ho-so?id=${id}`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportHS1(id, loai:number=1, queryParams=null): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.parseFilter(queryParams);
		return this.http.get(API_URL + `/export-ho-so1?id=${id}&loai=${loai}`, {
			params: httpParams,
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	previewQD(ncc, itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${environment.ApiRoot}/quyet-dinh/get-quyet-dinh?id=${ncc}&qd=${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}

	exportQD(ncc, itemId: number, loai:number=1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${environment.ApiRoot}/quyet-dinh/export-quyet-dinh?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	
	downAllFiles(ncc: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/download-all-files?id=${ncc}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportDSDeNghiXetDuyet(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get(API_URL + `/export-list-dn-xet-duyet`, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	isViewChiTiet(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_URL + `/IsViewDetail?id=${item}`, { headers: httpHeaders })
			.pipe(
				map((res: any) => {
					return res;
				}),
				catchError(err => {
					return throwError(err);
				})
			);;
	}

	GetFieldTab(idDT: number = 0, idLoaiHS: number = 0): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-fields-tab?idDT=${idDT}&idLoaiHS=${idLoaiHS}`;
		return this.http.get(url, { headers: httpHeaders });
	}
}
