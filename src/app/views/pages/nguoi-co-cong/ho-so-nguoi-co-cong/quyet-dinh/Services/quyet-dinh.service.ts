import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../environments/environment';
import { QueryParamsModel, HttpUtilsService, QueryResultsModel } from '../../../../../../core/_base/crud';

const API_URL = environment.ApiRoot + '/quyet-dinh';
const API_NCC = environment.ApiRoot + '/ncc';

@Injectable()
export class QuyetDinhService {
	lastFilter$: BehaviorSubject<QueryParamsModel> = new BehaviorSubject(new QueryParamsModel({}, 'desc', 'NgayGui', 0, 10));
	ReadOnlyControl: boolean = false;

	constructor(private http: HttpClient, private httpUtils: HttpUtilsService) { }

	// READ
	getAllItems(): Observable<any[]> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.get<any[]>(API_URL + '?more=true', { headers: httpHeaders });
	}

	findData(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		const url = API_URL;
		return this.http.get<QueryResultsModel>(url, {
			headers: httpHeaders,
			params: httpParams
		});
	}

	findDataNCC(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		return this.http.get<QueryResultsModel>(environment.ApiRoot + '/ncc', {
			headers: httpHeaders,
			params: httpParams
		});
	}


	getItem(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.get<any>(url, { headers: httpHeaders });
	}

	Create(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.post<any>(API_URL, item, { headers: httpHeaders });
	}

	Update(item: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		return this.http.put(API_URL + `/${item.Id}`, item, { headers: httpHeaders });
	}

	Delete(itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const url = `${API_URL}/${itemId}`;
		return this.http.delete<any>(url, { headers: httpHeaders });
	}

	previewQD(mau: number, ncc: any, itemId: number): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = '';
		if (mau == 0)
			url = `${API_URL}/get-quyet-dinh?id=${ncc}&qd=${itemId}`;
		if (mau == 1)
			url = `${API_URL}/get-quyet-dinh-tc?id=${ncc}&qd=${itemId}`;
		if (mau == 3)
			url = `${API_URL}/get-quyet-dinh-tc?id=${ncc}&qd=${itemId}&isCat=true`;
		if (mau == 2)
			url = `${API_URL}/get-phieu-bao?id=${ncc}&qd=${itemId}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}

	exportQD(mau: number, ncc: any, itemId: number, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = '';
		if (mau == 0)
			url = `${API_URL}/export-quyet-dinh?id=${ncc}&qd=${itemId}&loai=${loai}`;
		if (mau == 1)
			url = `${API_URL}/export-quyet-dinh-tc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		if (mau == 3)
			url = `${API_URL}/export-quyet-dinh-tc?id=${ncc}&qd=${itemId}&isCat=true&loai=${loai}`;
		if (mau == 2)
			url = `${API_URL}/export-quyet-dinh-dc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	downloadQD(mau: number, ncc: any, itemId: number, loai: number = 1): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = '';
		if (mau == 0)
			url = `${API_URL}/download-quyet-dinh?id=${ncc}&qd=${itemId}&loai=${loai}`;
		if (mau == 1)
			url = `${API_URL}/download-quyet-dinh-tc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		if (mau == 3)
			url = `${API_URL}/download-quyet-dinh-tc?id=${ncc}&qd=${itemId}&isCat=true&loai=${loai}`;
		if (mau == 2)
			url = `${API_URL}/download-quyet-dinh-dc?id=${ncc}&qd=${itemId}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	previewByTemplate(mau: number, ncc: any): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${API_URL}/get-by-template?id_template=${mau}&ncc=${ncc}`;
		return this.http.get(url, {
			headers: httpHeaders
		});
	}

	exportByTemplate(mau: number, ncc: any, loai: number = 1): Observable<any> { //cũ
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${API_URL}/export-by-template?id_template=${mau}&ncc=${ncc}&loai=${loai}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		});
	}

	downloadByTemplate(mau: number, ncc: any, ispdf: boolean = true): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		let url = `${API_URL}/download-by-template?id_template=${mau}&ncc=${ncc}&ispdf=${ispdf}`;
		return this.http.get(url, {
			headers: httpHeaders,
			responseType: 'blob',
			observe: 'response'
		})
	}

	//#region ncc
	downloadDSThoCung(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/export-ds-tho-cung`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		})
	}

	getDSThoCung(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/get-ds-tho-cung`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
		});
	}

	downloadDSKham(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/export-ds-kham`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		})
	}

	getDSKham(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/get-ds-kham`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
		});
	}

	downloadTruyTangBMVNAH(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/export-ds-truytang-bm`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		})
	}

	getTruyTangBMVNAH(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_NCC}/get-ds-truytang-bm`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
		});
	}
	//#endregion

	exportDSQuyetDinh(queryParams: QueryParamsModel): Observable<any> {
		const httpHeaders = this.httpUtils.getHTTPHeaders();
		const httpParams = this.httpUtils.getFindHTTPParams(queryParams);
		let url = `${API_URL}/export-list`;
		return this.http.get(url, {
			headers: httpHeaders,
			params: httpParams,
			responseType: 'blob',
			observe: 'response'
		});
	}
}