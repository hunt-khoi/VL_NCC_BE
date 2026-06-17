import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { MauSoLieuModel } from './../Model/mau-so-lieu.model';
import { environment } from '../../../../../../../environments/environment';

const API_URL = environment.ApiRoot + '/mau-so-lieu';

@Injectable()
export class MauSoLieuService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	getAllItems(): Observable<MauSoLieuModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<MauSoLieuModel[]>(API_URL + '?more=true', { headers: httpHeaders });
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

	getListMauSoLieuDetailByIdMauSoLieu(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/detail/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	CreateData(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	deleteItem(itemId: number, Force: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}?Force=${Force}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	UpdateData(Id: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${Id}`, item, { headers: httpHeaders });
	}

	deleteDetailChild(itemId: number, force: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/deleteChild/${itemId}?Force=${force}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	DeleteDetail(itemId: number, force: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/deleteDetail/${itemId}?Force=${force}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	CreateDetail(idMauSoLieu: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + `/createDetail/${idMauSoLieu}`, item, { headers: httpHeaders });
	}

	CreateSoLieuCon(idMauSoLieu: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + `/createSoLieuCon/${idMauSoLieu}`, item, { headers: httpHeaders });
	}

	CreateDetailChild(idDetail: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + `/CreateDetailChild/${idDetail}`, item, { headers: httpHeaders });
	}

	// list don vi selected
	listGiao(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/get-list-giao?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	deleteGiao(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/delete-giao?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	updateGiao(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/update-giao`;
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}

	Lock(itemId: number, value: boolean) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/Lock?id=${itemId}&Value=${value}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	DeleteDonVi(itemId: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/deleteDonVi/${itemId}`;
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}

	// DELETE => DELETE DETAIL PARENT
	DeleteDetailParent(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + `/deleteDetailParent/`, item, { headers: httpHeaders });
	}

	getDonVi(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/donvi/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getSoLieu(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/solieu/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	exportChiTiet(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_URL}/export-chi-tiet/${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	nhacNhoNhap(id: number, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/nhac-nho-nhap/`+id;
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}
}