import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/ke-hoach-van-dong';

@Injectable()
export class KeHoachVanDongService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	//danh sách kế hoạch vận động
	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	//ds kế hoạch được giao
	findDataGiao(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL + '/list-giao';
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

	getDetailByIdKeHoach(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/detail/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	GetDonViGiao(): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API_URL + `/get-dvs-giao`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	// Thêm, sửa, xóa kế hoạch vận động
	CreateData(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	UpdateData(Id, item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${Id}`, item, { headers: httpHeaders });
	}

	deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	// Lưu, xóa chi tiết kế hoạch
	DeleteDetail(itemId: number, ischild: boolean = false): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/delete-detail/${itemId}/${ischild}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}
	SaveDetail(idKeHoach: number, ischild: boolean = false, item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL + `/update-detail/${idKeHoach}/${ischild}`, item, { headers: httpHeaders });
	}

	// Giao chi tiết
	giaoDetails(items, isgiao: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/giaos/${isgiao}`;
		return this.http.post<any>(url, items, { headers: httpHeaders });
	}

	// Nhắc nhở vận động
	nhacNhos(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/nhac-nho/${id}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	exportCTKeHoach(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_URL}/export-chi-tiet-ke-hoach/` + itemId;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	xuatThuNgo(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_URL}/xuat-thu-ngo-dv/` + itemId;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
