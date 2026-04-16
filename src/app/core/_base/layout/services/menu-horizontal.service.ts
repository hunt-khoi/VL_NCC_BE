import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as objectPath from 'object-path';
// Services
import { MenuConfigService } from './menu-config.service';
import { CommonService } from 'app/views/pages/nguoi-co-cong/services/common.service';
import { HttpUtilsService, QueryParamsModel } from '../../crud';
import { environment } from 'environments/environment';

@Injectable()
export class MenuHorizontalService {
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	quantitySubmenu$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	activeMenu$: number = 0;

	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 */
	constructor(private menuConfigService: MenuConfigService,
		private commonService: CommonService,
		private http: HttpClient,
		private httpUtils: HttpUtilsService) 
	{
		this.loadMenu();
		this.GetConfigTimeOut();
		this.commonService.TimesOutExpire();
	}

	/**
	 * Load menu list
	 */
	async loadMenu() {
		await this.menuConfigService.getMenus().then(
			res => {
				setTimeout(() => {
					const menuItems: any[] = objectPath.get(res, 'header.items');
					this.menuList$.next(menuItems);
				});
			});
	}

	async GetConfigTimeOut() {
		await this.commonService.getConfig(['TIME_LOGOUT','DROP_BUTTON']).toPromise().then(res => {
			if (res && res.status == 1) {
				if (res.data.DROP_BUTTON != undefined) 
					localStorage.setItem('DROP_BUTTON',res.data.DROP_BUTTON );
				if (res.data.TIME_LOGOUT == undefined || res.data.TIME_LOGOUT == '') {
					localStorage.setItem('TIME_LOGOUT', '0');//gán mặc định nếu result trả về lỗi
				}
				else { 
					localStorage.setItem('TIME_LOGOUT',res.data.TIME_LOGOUT);//res.data.TIME_LOGOUT
				}
			}
			else
			{
				localStorage.setItem('TIME_LOGOUT', '0');//gán mặc định nếu result trả về lỗi
				localStorage.setItem('DROP_BUTTON','1');
			}
		})
	}

	getSubMenu(queryParams: any) {
		this.loadSubmenu(queryParams).subscribe(res=>{
			if(res.status==1){
				this.quantitySubmenu$.next(res.data);
			}			
		})
	}

	loadSubmenu(queryParams: QueryParamsModel) {
		const userToken = localStorage.getItem(environment.authTokenKey);
		queryParams.filter.active = this.activeMenu$ ? this.activeMenu$ : 0;
		const httpParms = this.httpUtils.getFindHTTPParams(queryParams)
		const httpHeaders = new HttpHeaders({
			'Authorization': 'Bearer ' + userToken,
		});
		return this.http.get<any>(environment.ApiRoot+`/user/getSubMenu`, { headers: httpHeaders, params:httpParms });	
	}
}