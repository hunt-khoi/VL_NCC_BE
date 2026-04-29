import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { DoiTuongBHYTModel, DoiTuongDCCHModel, DoiTuongNguoiCoCongModel, DoiTuongNhanQuaModel } from './../Model/doi-tuong-nguoi-co-cong.model';

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
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

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
	CreateDoiTuongNguoiCoCong(item: DoiTuongNguoiCoCongModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}
	UpdateDoiTuongNguoiCoCong(item: DoiTuongNguoiCoCongModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}
	UpdateBieuMau(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/update-bieu-mau/${item.Id}`, item, { headers: httpHeaders });
	}
	DeleteNguoiCoCong(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	LockNguoiCoCong(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// đối tượng nhận quà
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
	CreateDoiTuongNhanQua(item: DoiTuongNhanQuaModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_NQ, item, { headers: httpHeaders });
	}
	UpdateDoiTuongNhanQua(item: DoiTuongNhanQuaModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_NQ + `/${item.Id}`, item, { headers: httpHeaders });
	}
	UpdateMucQuaDoiTuongs(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_URL_NQ + `/cap-nhat-muc-qua`, item, { headers: httpHeaders });
	}
	UpdateMucQua(Id: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_NQ + `/cap-nhat-muc-qua/${Id}`, item, { headers: httpHeaders });
	}
	LockNhanQua(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_NQ}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	DeleteNhanQua(itemId: number): Observable<any> {
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
	CreateDoiTuongBHYT(item: DoiTuongBHYTModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_BH, item, { headers: httpHeaders });
	}
	UpdateDoiTuongBHYT(item: DoiTuongBHYTModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_BH + `/${item.Id}`, item, { headers: httpHeaders });
	}
	LockBHYT(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_BH}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	DeleteBHYT(itemId: number): Observable<any> {
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
	CreateDoiTuongDCCH(item: DoiTuongDCCHModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL_DC, item, { headers: httpHeaders });
	}
	UpdateDoiTuongDCCH(item: DoiTuongDCCHModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_DC + `/${item.Id}`, item, { headers: httpHeaders });
	}
	LockDCCH(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_DC}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	DeleteDCCH(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL_DC}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
}