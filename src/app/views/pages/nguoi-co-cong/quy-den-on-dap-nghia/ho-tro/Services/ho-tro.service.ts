import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { HoTroModel } from '../Model/ho-tro.model';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';
import { HoTro_DTModel } from '../../dt-ho-tro-quy/Model/dt-ho-tro-quy.model';

const API_PRODUCTS_URL = environment.ApiRoot + '/ho-tro';
const API_PRODUCTS_DT = environment.ApiRoot + '/dt-ho-tro';

@Injectable()
export class HoTroService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(API_PRODUCTS_URL, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	createDanhSach(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	updateDanhSach(item: HoTroModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	getListHoTro(ids: string=""): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/list-can-ho-tro/${ids}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	
	hoTroDT(itemId: number, item: HoTro_DTModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_DT +`/ho-tro/${itemId}`, item, { headers: httpHeaders });
    }


	//API cho phần duyệt ===========
	duyetDanhSach(itemId: number, value: boolean, note: string): Observable<any> {
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
		const url = `${API_PRODUCTS_URL}/thu-hoi?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getGiayBaoTien(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-giay-bao-tien?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	exportGiayBaoNhanTien(id, loai: number = 1) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/export-giay-bao-tien?id=${id}&loai=${loai}`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	taoQuyetDinh(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/tao-quyet-dinh", item, { headers: httpHeaders });
	}

	downloadQD(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_PRODUCTS_URL + `/download-qd-cap-tien?id=${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
