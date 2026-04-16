import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as objectPath from 'object-path';
import { MenuConfigService } from './menu-config.service';

@Injectable()
export class MenuAsideService {
	menuList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	/**
	 * Service constructor
	 *
	 * @param menuConfigService: MenuConfigService
	 */
	constructor(private menuConfigService: MenuConfigService) {
		this.loadMenu();
	}

	/**
	 * Load menu list
	 */
	async loadMenu() {
		await this.menuConfigService.getMenus().then(
			res => {
				setTimeout(() => {
					const menuItems: any[] = objectPath.get(res, 'aside.items');
					this.menuList$.next(menuItems);
				});
			});
	}
}