
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route } from '@angular/router';
import { Injectable } from '@angular/core';
import { TokenStorage } from './token-storage.service';
import { UserProfileService } from './user-profile.service';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class PermissionUrl implements CanActivate, CanActivateChild, CanLoad {

	private permissionCache = new Map<string, boolean>();
	private cachedToken: string | null = null;

	constructor(private router: Router,
		private tokenStorage: TokenStorage,
		private per: UserProfileService,
		private snackBar: MatSnackBar
	) { }

	canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		throw new Error("Method not implemented.");
	}
	canLoad(route: Route): boolean {
		throw new Error("Method not implemented.");
	}

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		const token = await this.tokenStorage.getAccessToken().toPromise();
		if (!token) {
			this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
			return false;
		}
		// Clear cache when token changes (new login or token refresh)
		if (this.cachedToken !== token) {
			this.permissionCache.clear();
			this.cachedToken = token;
		}

		const urlKey = state.url.split('?')[0];
		if (this.permissionCache.has(urlKey)) {
			const cached = this.permissionCache.get(urlKey);
			if (!cached) 
				this.router.navigate(['/error/403'], { queryParams: { url: state.url } });
			return cached;
		}

		const re = await this.per.isPermission(state.url).toPromise()
			.then(res => {
				if (res && res.data) {
					this.snackBar.dismiss();
					return true;
				}
				return false;
			})
			.catch(() => false);

		this.permissionCache.set(urlKey, re);

		if (!re) {
			this.router.navigate(['/error/403'], { queryParams: { url: state.url } });
		}
		return re;
	}
}