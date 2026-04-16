import { DoiTuongBHYTModel, DoiTuongDCCHModel, DoiTuongNguoiCoCongModel, DoiTuongNhanQuaModel } from './../Model/doi-tuong-nguoi-co-cong.model';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/doi-tuong-ncc';
const API_URL_NQ = environment.ApiRoot + '/dm-doi-tuong-nhan-qua';
const API_URL_BH = environment.ApiRoot + '/dm-doi-tuong-bhyt';
const API_URL_DC = environment.ApiRoot + '/dm-doi-tuong-dcch';

@Injectable()
export class DoiTuongNguoiCoCongService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterNQ$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterBH$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDC$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<DoiTuongNguoiCoCongModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<DoiTuongNguoiCoCongModel[]>(API_URL + '?more=true', { headers: httpHeaders });
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
	CreateDoiTuongNguoiCoCong(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongNguoiCoCong(item: DoiTuongNguoiCoCongModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}
	
	// UPDATE => PUT: update the product on the server
	UpdateBieuMau(item: any): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/update-bieu-mau/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	Lock(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// đói tượng nhận quà
	
	findDataNhanQua(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL_NQ;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItemNhanQua(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_NQ}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongNhanQua(item: DoiTuongNhanQuaModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_NQ + `/${item.Id}`, item, { headers: httpHeaders });
	}
	UpdateMucQua(Id, item): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_NQ + `/cap-nhat-muc-qua/${Id}`, item, { headers: httpHeaders });
	}
	UpdateMucQuaDoiTuongs(item): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_URL_NQ + `/cap-nhat-muc-qua`, item, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	CreateDoiTuongNhanQua(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_NQ, item, { headers: httpHeaders });
	}
	LockNhanQua(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_NQ}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// DELETE => delete the product from the server
	deleteItemNhanQua(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_NQ}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

// đối tượng bhyt ===================
	findDataDoiTuongBHYT(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL_BH;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItemBHYT(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_BH}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongBHYT(item: DoiTuongBHYTModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_BH + `/${item.Id}`, item, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	CreateDoiTuongBHYT(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_BH, item, { headers: httpHeaders });
	}
	LockBHYT(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_BH}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// DELETE => delete the product from the server
	deleteItemBHYT(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_BH}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	// đối tượng dụng cụ chỉnh hình ===================
	findDataDoiTuongDCCH(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL_DC;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItemDCCH(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_DC}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// UPDATE => PUT: update the product on the server
	UpdateDoiTuongDCCH(item: DoiTuongDCCHModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_DC + `/${item.Id}`, item, { headers: httpHeaders });
	}
	// CREATE =>  POST: add a new oduct to the server
	CreateDoiTuongDCCH(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_DC, item, { headers: httpHeaders });
	}
	LockDCCH(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_DC}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	// DELETE => delete the product from the server
	deleteItemDCCH(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_DC}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
}
