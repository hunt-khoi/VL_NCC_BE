import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService } from '../../../../../core/_base/crud';

const API = environment.ApiRoot + '/comment';

@Injectable()
export class CommentService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean = false; 
	constructor(private http: HttpClient,
		private httpUtils: HttpUtilsService) { }

	getDSYKien(Id: number, Loai: number, include_cmt: boolean = true): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let p = new QueryParamsModel({ object_type: Loai, object_id: Id, include_cmt: (include_cmt ? "1" : "0") });
		let params = this.httpUtils.getFindHTTPParams(p);
		return this.http.get<any>(API, {
			headers: httpHeaders,
			params: params
		});
	}

	getDSYKienInsert(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API, item, { headers: httpHeaders });
	}

	update(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put<any>(API + `/${item.id_row}`, item, { headers: httpHeaders });
	}

	like(id: number, type: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = API + '/like?id=' + id + '&type=' + type;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	remove(id: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.delete<any>(API + `/${id}`, { headers: httpHeaders });
	}
}