import { environment } from 'environments/environment';
import { HttpUtilsService } from 'app/core/_base/crud/utils/http-utils.service';
import { QueryParamsModel } from 'app/core/_base/crud';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API_PRODUCTS_URL = environment.ApiRoot + '/phat-qua';

@Injectable()
export class PhatQuaService {

  lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'asc', '', 0, 10));
  lastFilterDSExcel$: BehaviorSubject<any[]> = new BehaviorSubject([]);
  lastFilterInfoExcel$: BehaviorSubject<any> = new BehaviorSubject(undefined);
  lastFileUpload$: BehaviorSubject<{}> = new BehaviorSubject({});
  data_import: BehaviorSubject<any[]> = new BehaviorSubject([]);

  ReadOnlyControl: boolean;
  constructor(private http: HttpClient,
    private httpUtils: HttpUtilsService) { }

  // READ
  ListNhanQua(id,queryParams): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
    return this.http.get<any>(API_PRODUCTS_URL + '/' + id, { 
      headers: httpHeaders,
      params: httpParams });
  }

  Get_NextGift(id): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    return this.http.get<any>(API_PRODUCTS_URL + '/Get_NextGift?id_suggest_detail=' + id, { 
      headers: httpHeaders });
  }
  Create(data): Observable<any> {
    const httpHeaders = this.httpUtils.getHTTPHeaders();
    return this.http.post<any>(API_PRODUCTS_URL, data ,{ 
      headers: httpHeaders });
  }

}
