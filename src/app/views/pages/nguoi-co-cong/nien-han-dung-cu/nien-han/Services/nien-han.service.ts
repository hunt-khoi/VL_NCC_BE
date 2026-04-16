import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { NienHanModel } from '../Model/nien-han.model';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/nhap-nien-han';

@Injectable()
export class NienHanService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	// READ
	getAllItems(): Observable<NienHanModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<NienHanModel[]>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel, cap: number = 2): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = API_PRODUCTS_URL;
		if (cap == 2)
			url += "/list-huyen";
		if (cap == 3)
			url += "/list-xa";
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	getItem(itemId: number, isGiam = false, isxa = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}?isGiam=` + isGiam + `&isxa=`  + isxa;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	getDot(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-dot`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	getNguoiNhanByDot(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-dung-cu?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	getRange(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-range`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// Clone
	Clone(item, isxa = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/clone" + `?isxa=` + isxa, item, { headers: httpHeaders });
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

	// CREATE =>  POST: add a new oduct to the server
	createDotNienHan(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	updateDotNienHan(item: NienHanModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	// DELETE => delete the product from the server
	deleteItem(itemId: number, isxa = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}` + `&` + isxa;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	//API cho phần duyệt
	duyetDotNienHan(itemId: number, value: boolean, note: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/duyet?id${itemId}&value=${value}&note=${note}`;
		return this.http.get<any>(url, { headers: httpHeaders });
		//value=true là duyệt, value=false là không duyệt
	}

	guiDuyet(itemId: number, isxa: boolean = false, isupdate: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/gui-duyet?id=${itemId}`+ `&isxa=`  + isxa + `&isupdate=`  + isupdate;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	thuHoi(itemId: number, isxa: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/thu-hoi?id=${itemId}` + `&isxa=`  + isxa;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	huyGiao(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/huy-giao?id=${itemId}`;
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

	exportDeXuatDot(id, dv, mau: number, inngang: boolean = true, loai: number = 1) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/export-de-xuat-dot?id=${id}&idHuyen=${dv}&mau=${mau}&inngang=${inngang}&loai=${loai}`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	previewDeXuatDot(id, dv, mau: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/get-de-xuat-dot?id=${id}&idHuyen=${dv}&mau=${mau}`, { headers: httpHeaders });
	}

	exportExcelNienHan(id, isxa=false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-excel-nien-han?id=` + id + `&isxa=`  + isxa;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	taoToTrinh(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/tao-to-trinh", item, { headers: httpHeaders });
	}

	downloadTT(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_PRODUCTS_URL + `/download-to-trinh-duyet?id=${itemId}`;
		return this.http.get(url, {
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

	ListCapTien(queryParams): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<any>(API_PRODUCTS_URL + '/list-cap-tien', { 
		  headers: httpHeaders,
		  params: httpParams });
	}

	capTienDC(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/cap/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	capTienAll(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/caps`;
		return this.http.post<any>(url, item, { headers: httpHeaders });
	}
}
