import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { QueryParamsModel, HttpUtilsService } from '../../../../../../core/_base/crud';
import { environment } from '../../../../../../../environments/environment';

const API_PRODUCTS_URL = environment.ApiRoot + '/tinh-hinh-bao-hiem';

@Injectable()
export class TinhHinhMuaBaoHiemService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
	lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
	data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }


	// READ
	getItem(thang, loai): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/get-bc-thang?thang=${thang}&loai=${loai}`;
		return this.http.get<any>(url, { headers: httpHeaders });
    }
    
	export(thang, loai, inngang, type): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders()
		const url = `${API_PRODUCTS_URL}/export-bc-thang?thang=${thang}&loai=${loai}&inngang=${inngang}&type=${type}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}
	
}
