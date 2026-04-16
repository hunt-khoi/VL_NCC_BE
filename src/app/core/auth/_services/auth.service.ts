import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { User } from '../_models/user.model';
import { catchError, map, tap } from 'rxjs/operators';
import { QueryParamsModel, QueryResultsModel } from '../../_base/crud';
import { environment } from '../../../../environments/environment';
import { TokenStorage } from './token-storage.service';

const API_USERS_URL = 'api/users';
const API_USERS = environment.ApiRoot + '/user';
const API_LOGIN_URL = environment.ApiRoot + '/user/Login';
const API_LOGOUT_URL = environment.ApiRoot + '/user/Logout';

@Injectable()
export class AuthService {
	constructor(private http: HttpClient, 
		private tokenStorage: TokenStorage) { }

	// Authentication/Authorization
	login(username: string, password: string, checkReCaptCha: boolean, GReCaptCha: string): Observable<any> {
		const cur_vaitro: any = localStorage.getItem('cur_vaitro');
		let data = {
			username: username,
			password: password,
			checkReCaptCha: checkReCaptCha,
			GReCaptCha: GReCaptCha,
			cur_vaitro: cur_vaitro
		}
		return this.http.post<any>(API_LOGIN_URL, data)
			.pipe(
				map((result: any) => {
					return result;
				}),
				tap(this.saveAccessData.bind(this)),
				catchError(this.handleError('login', []))
			);
	}
	private saveAccessData(response: any) {
		if (response && response.status === 1) {
			this.tokenStorage.updateStorage(response.data);
		}
		else {
			throwError({ msg: 'error' });
		}
	}

	getUserByToken(): Observable<User> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Authorization', 'Bearer ' + userToken);
		return this.http.get<User>(API_USERS_URL, { headers: httpHeaders });
	}

	register(user: User): Observable<any> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<User>(API_USERS_URL, user, { headers: httpHeaders })
			.pipe(
				map((res: User) => {
					return res;
				}),
				catchError(() => {
					return null;
				})
			);
	}

	/*
	 * Submit forgot password request
	 *
	 * @param {string} email
	 * @returns {Observable<any>}
	 */
	public requestPassword(email: string): Observable<any> {
		return this.http.get(API_USERS + '/ForgotPassword?username=' + email)
			.pipe(catchError(this.handleError('forgot-password', [])));
	}

	getAllUsers(): Observable<User[]> {
		return this.http.get<User[]>(API_USERS_URL);
	}

	getUserById(userId: number): Observable<User> {
		return this.http.get<User>(API_USERS_URL + `/${userId}`);
	}

	// Method from server should return QueryResultsModel(items: any[], totalsCount: number)
	// items => filtered/sorted result
	findUsers(queryParams: QueryParamsModel): Observable<QueryResultsModel> {
		const httpHeaders = new HttpHeaders();
		httpHeaders.set('Content-Type', 'application/json');
		return this.http.post<QueryResultsModel>(API_USERS_URL + '/findUsers', queryParams, { headers: httpHeaders });
	}

	/*
	 * Handle Http operation that failed.
	 * Let the app continue.
   *
   * @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead
			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	resetSession(): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.post<any>(environment.ApiRoot + '/user/ResetSession', null, { headers: httpHeaders })
			.pipe(
				map((res: any) => {
					return res;
				}),
				catchError(err => {
					return throwError(err);
				})
			);
	}

	public logout(refresh?: boolean): void {
		this.logout_new().subscribe(
			res => {
				this.tokenStorage.clear();
				if (refresh) {
					location.reload(true);
				}
			},
			err => {
				this.tokenStorage.clear();
				if (refresh) {
					location.reload(true);
				}
			});
	}
	logout_new(): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.get<any>(API_LOGOUT_URL, { headers: httpHeaders })
			.pipe(
				map((res: any) => {
					return res;
				}),
				catchError(err => {
					return throwError(err);
				})
			);
	}

	//#region service worker
	CreateFCM(): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		return this.http.get<any>(environment.ApiRoot + `/fcm/CreateFCM`, { headers: httpHeaders });
	}

	DeleteFCM(data: any): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.post<any>(environment.ApiRoot + `/fcm/DeleteFCM`, data, { headers: httpHeaders });
	}
	//#endregion

	//#region vai trò
	getVaiTro(): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.get<any>(environment.ApiRoot + '/user/ds-vai-tro', { headers: httpHeaders });
	}
	doiVaiTro(id: number): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.get<any>(environment.ApiRoot + '/user/doi-vai-tro?VaiTro=' + id, { headers: httpHeaders });
	}
	//#endregion
	
	getDictionary(): Observable<any> {
		const userToken = localStorage.getItem(environment.authTokenKey);
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		httpHeaders.append("Content-Type", "application/json");
		return this.http.get<any>(environment.ApiRoot + '/lite/get-dictionary', { headers: httpHeaders });
	}
}