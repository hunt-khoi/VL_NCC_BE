import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { HttpUtilsService } from '../../../../../../core/_base/crud/utils/http-utils.service';
import { QueryParamsModel, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_ROOT_URL = environment.ApiRoot + '/quy-trinh-duyet';

@Injectable()
export class QuaTrinhKhongCoNguoiDuyetService {
	ReadOnlyControl: boolean = false;
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }
	getData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<any>(API_ROOT_URL + '/GetListNoChecker', { headers: httpHeaders, params: httpParams });
	}
	updateQuaTrinhKhongCoNguoiDuyet(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_ROOT_URL + '/UpdateChecker', item, { headers: httpHeaders });
	}
	GetListLoai() {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_ROOT_URL + '/GetListLoai', { headers: httpHeaders });
	}
	GetListNextChecker(id_quatrinh, nguoi_gui) {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any>(API_ROOT_URL + `/GetListNextChecker?id_quatrinh=${id_quatrinh}&IdNguoiGui=${nguoi_gui}`, { headers: httpHeaders });
	}
}
