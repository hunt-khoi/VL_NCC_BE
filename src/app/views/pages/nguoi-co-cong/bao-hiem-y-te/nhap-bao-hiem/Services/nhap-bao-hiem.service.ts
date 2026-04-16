import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { BaoHiemYTModel } from '../Model/nhap-bao-hiem.model';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';
import { DoiTuongBaoHiemModel } from '../../doi-tuong-bao-hiem/Model/doi-tuong-bao-hiem.model';

const API_PRODUCTS_URL = environment.ApiRoot + '/bao-hiem';
const API_URL_DT = environment.ApiRoot + '/doi-tuong-bao-hiem';

@Injectable()
export class NhapBaoHiemService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	getItem(itemId: number, isGiam = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}?isGiam=` + isGiam;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getNguoiHuongBH(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-nguoi-de-nghi`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	checkAllowNhap(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/allow-nhap`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// Clone
	Clone(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/clone", item, { headers: httpHeaders });
	}

	BaoGiam(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/bao-giam", item, { headers: httpHeaders });
	}
	UpdateGiam(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/update-giam", item, { headers: httpHeaders });
	}
	HuyBaoGiam(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + "/huy-bao-giam?id=" + id, { headers: httpHeaders });
	}
	BaoTang(id, item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put<any>(API_PRODUCTS_URL + "/bao-tang/" + id, item, { headers: httpHeaders });
	}
	HuyBaoTang(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + "/huy-bao-tang?id=" + id, { headers: httpHeaders });
	}

	createItem(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	updateItem(item: BaoHiemYTModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	//API cho phần duyệt
	duyetDanhSach(itemId: number, value: boolean, note: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyet?id${itemId}&value=${value}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });
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

	//API cho phần import
	importFile(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/import', item, { headers: httpHeaders });
	}

	downloadTemplate(idDot): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		return this.http.get(API_PRODUCTS_URL + `/download-template?id=` + idDot, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	
	exportExcelBH(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-excel-nhap?id=` + id;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	ListCapBHYT(queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<any>(API_PRODUCTS_URL + '/list-cap-bhyt', { 
		  headers: httpHeaders,
		  params: httpParams });
	}

	UpdateDoiTuongBaoHiem(item: DoiTuongBaoHiemModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL_DT + `/${item.Id}`, item, { headers: httpHeaders });
	}
}