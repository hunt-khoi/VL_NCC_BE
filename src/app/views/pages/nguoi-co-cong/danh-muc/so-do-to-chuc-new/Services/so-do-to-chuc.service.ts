import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { UpdateThongTinChucVuModel, OrgChartModel, ChartStaffModel } from '../Model/so-do-to-chuc.model';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_PRODUCTS_URL = environment.ApiRoot + '/so-do-to-chuc';

@Injectable()
export class OrgChartService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	CreateOrgChart(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL , item, { headers: httpHeaders });
	}

	getAllItems(): Observable<OrgChartModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<OrgChartModel[]>(API_PRODUCTS_URL, { headers: httpHeaders });
	}

	GetOrganizationalChart(jobtitleid: any): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${jobtitleid}`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
		});
	}

	DeleteOrgChart(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	handleDropLevel(item: OrgChartModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_PRODUCTS_URL + '/handleDropOrgChartNew?idfrom=' + item.drop_idfrom + '&namefrom=' + item.drop_namefrom + '&idto=' + item.drop_idto + '&nameto=' + item.drop_nameto + '&IsAbove=' + item.IsAbove, item, { headers: httpHeaders });
	}

	handleDropParent(item: OrgChartModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_PRODUCTS_URL + '/handleDropOrgChart?idfrom=' + item.drop_idfrom + '&namefrom=' + item.drop_namefrom + '&idto=' + item.drop_idto + '&level=' + item.drop_levelto + '&nameto=' + item.drop_nameto, item, { headers: httpHeaders });
	}

	UpdateThongTinChucVu(item: UpdateThongTinChucVuModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL + `/${item.ID}`, item, { headers: httpHeaders });
	}

	SelectedNodeChanged(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_PRODUCTS_URL + `/${id}`, { headers: httpHeaders });
	}

	handleDropStaff(item: ChartStaffModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post(API_PRODUCTS_URL + '/handleDropStaff?id_nv=' + item.id_nv + '&id_chucdanhmoi=' + item.id_chucdanhmoi , item, { headers: httpHeaders });
	}

	GetOrganizationalChartById(idItem: any): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}?jobtitleid=${idItem}`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
		});
	}
}