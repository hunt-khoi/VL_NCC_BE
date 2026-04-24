import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../reducers';
import { TokenStorage } from './token-storage.service';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../../environments/environment';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private store: Store<AppState>,
		private router: Router,
		private tokenStorage: TokenStorage) { }


	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		let token = await this.tokenStorage.getAccessToken().toPromise()
		if (token && this.isTokenExpired()) {
			// logged in so return true
			if (state.url.startsWith('/auth'))
				this.router.navigateByUrl('/');
			return true;
		}
		// not logged in so redirect to login page with the return url
		if (!state.url.startsWith('/auth'))
			this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
		else
			return true;
		return false;
	}

	getToken(): string {
		return localStorage.getItem(environment.authTokenKey) || '';
	}

	getTokenExpirationDate(token: string): Date | null {
		const decoded = jwt_decode(token);
		if (decoded.exp === undefined) 
			return null;
		const date = new Date(0);
		date.setUTCSeconds(decoded.exp);
		return date;
	}

	isTokenExpired(token?: string): boolean {
		if (!token) token = this.getToken();
		if (!token) return false;
		const date = this.getTokenExpirationDate(token);
		if (!date) return false;
		return (date.valueOf() > new Date().valueOf());
	}
}