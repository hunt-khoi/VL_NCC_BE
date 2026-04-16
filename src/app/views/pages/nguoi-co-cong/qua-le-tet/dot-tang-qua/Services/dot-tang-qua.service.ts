import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { dottangquaModel, dottangqua_NCCModel } from '../Model/dot-tang-qua.model';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/dot-tang-qua';
const API_TK = environment.ApiRoot + '/tk-dot-tang-qua';

@Injectable()
export class dottangquaService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<dottangquaModel[]> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<dottangquaModel[]>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
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
	createDotTangQua(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	updateDotTangQua(item: dottangquaModel): Observable<any> {
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

	lock(itemId: any, islock: boolean): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/lock?id=${itemId}&value=${islock}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	//Thêm xóa sửa đối tượng
	addDoiTuongs(items: dottangqua_NCCModel[]): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/add-doi-tuong`;
		return this.http.post<any>(url, items, { headers: httpHeaders });
	}

	editDoiTuongs(item: dottangqua_NCCModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/edit-doi-tuong`;
		return this.http.post(url, item, { headers: httpHeaders });
	}

	deleteDoiTuongs(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/delete-doi-tuong?${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	//API cho phần duyệt
	duyetDotTangQua(itemId: number, value: boolean, note: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyet?id${itemId}&value=${value}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });

		//value=true là duyệt, value=false là không duyệt
	}

	guiDuyet(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/gui-duyet?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	thuHoi(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/thu-hoi?id${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	//API cho phần import
	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/import', item, { headers: httpHeaders });
	}

	downloadTemplate(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		return this.http.get(API_PRODUCTS_URL + `/download-template`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	//API cho thống kê
	thongKeGiam(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/ds-giam`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	thongKeSL(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/thong-ke-sl`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	thongKeTang(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/ds-tang`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	
	thongKeTangGiam(nam, idHuyen, idXa): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_TK}/thong-ke-tang-giam?nam=${nam}&idHuyen=${idHuyen}&idXa=${idXa}`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
		});
	}


	//API Export 
	exportDSGiam(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-ds-giam`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportDSTang(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-ds-tang`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportThongKeSL(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-thong-ke-sl`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	exportTKTangGiam(nam, idHuyen, idXa, inngang, type): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		//const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = `${API_TK}/export-thong-ke-tang-giam?nam=${nam}&idHuyen=${idHuyen}&idXa=${idXa}&inngang=${inngang}&type=${type}`;
		return this.http.get(url, {
			headers: httpHeaders,
			//params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}

	//#region số tt
	list_sott(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/list-sott?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	update_Sott(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/update-sott', item, { headers: httpHeaders });
	}
	//#endregion
}
