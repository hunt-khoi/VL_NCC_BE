import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { HttpUtilsService } from '../../../../../../../app/core/_base/crud/utils/http-utils.service';
import { QueryParamsModel, QueryResultsModel } from '../../../../../../../app/core/_base/crud';
import { PriorityAddData, NhapQuyTrinhDuyetModel, NhapCapQuanLyDuyetModel } from '../Model/nhap-quy-trinh-duyet.model';
import { map } from 'rxjs/operators';
const API_PRODUCTS_URL = environment.ApiRoot + '/quy-trinh-duyet';

@Injectable()
export class NhapQuyTrinhDuyetService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', '', 0, 10));
	lastFilter1$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	VisibleQTD: boolean;
	VisibleCQL: boolean;

	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	//====Danh sách quy trình duyệt===
	findData(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL + '/Get_DSQuyTrinhDuyet';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	//====Update quy trình duyệt===
	CreateQuyTrinhDuyet(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/Update_QuyTrinhDuyet', item, { headers: httpHeaders });
	}

	get_ChiTietQuyTrinhDuyet(itemId: number): Observable<NhapQuyTrinhDuyetModel> {

		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/Get_ChiTietQuyTrinhDuyet?ID=${itemId}`, { headers: httpHeaders }).pipe(
			map(res => {
				if (res && res.status === 1) {
					return res.data;
				}
				else {
					if (res.status === 0) {
						let itemError = new NhapQuyTrinhDuyetModel();
						itemError.ID_QuyTrinh = -2;
						itemError.TenQuyTrinh = res.error.code + ' - ' + res.error.message;
						return itemError;
					}
					return undefined;
				}
			})
		);
	}
	//====Xoa quy trinh duyet
	deleteQuyTrinhDuyet(itemId: number, ten: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/Delete_QuyTrinhDuyet?id=${itemId}&TenQuyTrinh=${ten}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	//=========Danh sách cấp quản lý duyệt
	findDataCapQuanLy(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL + '/Get_DSCapQuanLy';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	findAllCapQuanLy(id): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_PRODUCTS_URL + '/Get_DSCapQuanLy?more=true&sortOrder=asc&sortField=ViTri&filter.keys=ID_QuyTrinh&filter.vals=' + id;
		return this.http.get<QueryResultsModel>(url, {headers: httpHeaders});
	}
	deleteCapQuanLy(itemId: number, ten: string, tencapduyet: string): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/Delete_CapQuanLy?id=${itemId}&TenQuyTrinh=${ten}&TenCapDuyet=${tencapduyet}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	CreateCapQuanLy(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/Update_CapQuanLy', item, { headers: httpHeaders });
	}

	get_ChiTietCapQuanLy(itemId: number): Observable<NhapCapQuanLyDuyetModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/Get_ChiTietCapQuanLy?ID=${itemId}`, { headers: httpHeaders }).pipe(
			map(res => {
				if (res && res.status === 1) {
					return res.data;
				}
				else {
					if (res.status === 0) {
						let itemError = new NhapCapQuanLyDuyetModel();
						itemError.ID_CapQuanLy = -2;
						return itemError;
					}
					return undefined;
				}
			})
		);
	}

	//---------Cập nhật vị trí===============
	updateViTri(item: PriorityAddData[]): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/Save_ViTri', item, { headers: httpHeaders });
	}
	GetListApprovalLevel(): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + '/GetListApprovalLevel', { headers: httpHeaders });
	}
	GetListApprovalLevel_Max(): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + '/GetListApprovalLevel_Max', { headers: httpHeaders });
	}
	GetListPermission(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + '/GetListPermission', { headers: httpHeaders });
	}
	GetListLoai(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + '/GetListLoai', { headers: httpHeaders });
	}
	GetListCapBack(IdQuyTrinh, IdCap, ViTri): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/GetListCapBack?IdQuyTrinh=${IdQuyTrinh}&IdCap=${IdCap}&ViTri=${ViTri}`, { headers: httpHeaders });
	}
	GetListProcessMethod(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/GetListProcessMethod`, { headers: httpHeaders });
	}
	//#region điều kiện

	findDataDieuKien(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL + '/Get_DSDieuKien';
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}
	deleteDieuKien(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/Delete_DieuKien?id=${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
	CreateDieuKien(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL + '/Update_DieuKien', item, { headers: httpHeaders });
	}

	get_ChiTietDieuKien(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/Get_ChiTietDieuKien?ID=${itemId}`, { headers: httpHeaders });
	}
	//#endregion
}
