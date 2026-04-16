import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_TK = environment.ApiRoot + '/tkdc-tang-giam';

@Injectable()
export class ThongKeTangGiamService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	//API cho thống kê 
	getThongKe(nam, idHuyen, idXa): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_TK}/get-thongke?nam=${nam}&idHuyen=${idHuyen}&idXa=${idXa}`;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
		});
	}


	//API Export 
	exportThongKe(nam, idHuyen, idXa, inngang, type): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_TK}/export-thongke?nam=${nam}&idHuyen=${idHuyen}&idXa=${idXa}&inngang=${inngang}&type=${type}`;
		return this.http.get(url, {
			headers: httpHeaders,
			//params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}
