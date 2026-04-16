import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { DeXuatModel, DeXuat_NCCModel } from '../Model/de-xuat.model';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/de-xuat';
const url = environment.ApiRoot + '/dot-tang-qua';

@Injectable()
export class DeXuatService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	// READ
	getAllItems(): Observable<DeXuatModel[]> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<DeXuatModel[]>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
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
	getItem(itemId: number, isGiam = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}?isGiam=` + isGiam;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	getDot(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-dot`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	getNguoiNhanByDot(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-nguoi-nhan?id=${itemId}`;
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
	HuyBaoTang(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + "/huy-bao-tang?", item, { headers: httpHeaders });
	}

	// CREATE =>  POST: add a new oduct to the server
	createDotTangQua(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
	}

	// UPDATE => PUT: update the product on the server
	updateDotTangQua(item: DeXuatModel): Observable<any> {
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
	previewDeXuat(id: any, mau: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/get-de-xuat?id=${id}&mau=${mau}`, {
			headers: httpHeaders
		});
	}
	exportDeXuat(id: any, mau: number, inngang: boolean = true, loai: number = 1) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(API_PRODUCTS_URL + `/export-de-xuat?id=${id}&mau=${mau}&inngang=${inngang}&loai=${loai}`, {
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
	//#region quyết định
	detailHuyen(id_dot, dv): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(url + `/detail-huyen?id_dot=${id_dot}&id_huyen=${dv}`, { headers: httpHeaders });
	}

	createHuyen(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(url + '/add-huyen', item, { headers: httpHeaders });
	}

	updateHuyen(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(url + `/edit-huyen`, item, { headers: httpHeaders });
	}
	previewQD(id: any, dv: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(url + `/get-quyet-dinh?id=${id}&id_huyen=${dv}`, {
			headers: httpHeaders
		});
	}
	exportQD(id: any, dv: any, inngang: boolean = false, loai:number=1) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get(url + `/export-quyet-dinh?id=${id}&id_huyen=${dv}&inngang=${inngang}&loai=${loai}`, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	exportExcelDeXuat(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-excel-de-xuat?id=` + id;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	//#endregion
}
