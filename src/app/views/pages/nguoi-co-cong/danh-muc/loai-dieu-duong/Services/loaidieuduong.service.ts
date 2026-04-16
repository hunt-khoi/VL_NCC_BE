import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, of } from 'rxjs';
import { map, retry } from 'rxjs/operators';
import { loaiDieuDuongModel } from '../Model/loaidieuduong.model';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_PRODUCTS_URL = environment.ApiRoot + '/loai-dieu-duong';

@Injectable()
export class loaiDieuDuongServices {
    lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
	ReadOnlyControl: boolean;
	constructor(private http: HttpClient,
        private httpUtils: HttpUtilsService) { }
        
    // READ
	getAllItems(): Observable<loaiDieuDuongModel[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<loaiDieuDuongModel[]>(API_PRODUCTS_URL + '?more=true', { headers: httpHeaders });
    }
    
    findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_PRODUCTS_URL ;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
    }
    
    getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
    }
    
    CreateLoaiDieuDuong(item): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_PRODUCTS_URL, item, { headers: httpHeaders });
    }
    
    UpdateLoaiDieuDuong(item: loaiDieuDuongModel): Observable<any> {
		// Note: Add headers if needed (tokens/bearer)
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_PRODUCTS_URL +`/${item.Id}`, item, { headers: httpHeaders });
    }
    
    deleteItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	lock(itemId: any, islock: boolean): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_PRODUCTS_URL}/lock?id=${itemId}&Value=${islock}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}
}