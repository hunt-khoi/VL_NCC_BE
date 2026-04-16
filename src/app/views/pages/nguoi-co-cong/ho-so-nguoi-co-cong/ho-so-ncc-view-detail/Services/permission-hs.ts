
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route } from '@angular/router';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { HoSoNCCService } from '../../ho-so-ncc/Services/ho-so-ncc.service';

@Injectable()
export class PermissionViewHS implements CanActivate, CanActivateChild, CanLoad {

	constructor(private router: Router,
		private hs: HoSoNCCService,
		private snackBar: MatSnackBar) { }

	canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		throw new Error("Method not implemented.");
	}

	canLoad(route: Route): boolean {
		throw new Error("Method not implemented.");
	}

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		var id = state.url.split("/")[2];
		let re = await this.hs.isViewChiTiet(id).toPromise()
			.then(res => {
				if (res && res.data)
				{
					this.snackBar.dismiss();
					return true;
				}
				else {
					return false;
				}
			})
			.catch(function (e) {
				return false;
			});

		if (!re) 
		{
			this.router.navigate(['/tiep-nhan-ho-so']);
		}
					
		return re;
	}
}
