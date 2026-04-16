import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Renderer2, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import objectPath from 'object-path';
import { LayoutConfigService, MenuHorizontalService, MenuOptions, OffcanvasOptions } from '../../../../core/_base/layout';
import { HtmlClassService } from '../../html-class.service';

@Component({
	selector: 'kt-menu-horizontal',
	templateUrl: './menu-horizontal.component.html',
	styleUrls: ['./menu-horizontal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MenuHorizontalComponent implements OnInit {
	// Public properties
	currentRouteUrl: any = '';
	rootArrowEnabled: boolean = false;

	menuOptions: MenuOptions = {
		submenu: {
			desktop: 'dropdown',
			tablet: 'accordion',
			mobile: 'accordion'
		},
		accordion: {
			slideSpeed: 200, // accordion toggle slide speed in milliseconds
			expandAll: false // allow having multiple expanded accordions in the menu
		}
	};

	offcanvasOptions: OffcanvasOptions = {
		overlay: true,
		baseClass: 'kt-header-menu-wrapper',
		closeBy: 'kt_header_menu_mobile_close_btn',
		toggleBy: {
			target: 'kt_header_mobile_toggler',
			state: 'kt-header-mobile__toolbar-toggler--active'
		}
	};
	@Output() getMenuItem: EventEmitter<any> = new EventEmitter();
	menuActive: number = 0;

	constructor(
		public htmlClassService: HtmlClassService,
		public menuHorService: MenuHorizontalService,
		private layoutConfigService: LayoutConfigService,
		private router: Router,
		private render: Renderer2,
		private cdr: ChangeDetectorRef) {
	}

	ngOnInit(): void {
		this.rootArrowEnabled = this.layoutConfigService.getConfig('header.menu.self.root-arrow');
		this.currentRouteUrl = this.router.url;
		let url_special = this.currentRouteUrl.split('/')[1];
		if (url_special == 'chi-tiet-ho-so')
			this.menuActive = 38; //active menu hồ sơ
		// if (url_special == 'don-vi')
		// 	this.menuActive = 16; //active menu quản trị
		this.checkRootMenu();
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.currentRouteUrl = this.router.url;
				this.cdr.markForCheck();
			});
	}

	/**
	 * Use for fixed left aside menu, to show menu on mouseenter event.
	 * @param e Event
	 */
	mouseEnter(e: Event) {
		// check if the left aside menu is fixed
		if (!document.body.classList.contains('kt-menu__item--hover')) {
			this.render.addClass(document.body, 'kt-menu__item--hover');
		}
	}

	/**
	 * Mouse Leave event
	 * @param event: MouseEvent
	 */
	mouseLeave(event: MouseEvent) {
		this.render.removeClass(event.target, 'kt-menu__item--hover');
	}

	/**
	 * Return Css Class Name
	 * @param item: any
	 */
	getItemCssClasses(item : any) {
		let classes = 'kt-menu__item';
		if (objectPath.get(item, 'submenu')) {
			classes += ' kt-menu__item--submenu';
		}
		if (!item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--active kt-menu__item--here';
			this.menuHorService.activeMenu$ = item.id;
		}
		if (item.submenu && this.isMenuItemIsActive(item)) {
			classes += ' kt-menu__item--open kt-menu__item--here';
			this.menuHorService.activeMenu$ = item.id;
		}
		if (objectPath.get(item, 'resizer')) {
			classes += ' kt-menu__item--resize';
		}
		const menuType = objectPath.get(item, 'submenu.type') || 'classic';
		if ((objectPath.get(item, 'root') && menuType === 'classic')
			|| parseInt(objectPath.get(item, 'submenu.width'), 10) > 0) {
			classes += ' kt-menu__item--rel';
		}
		const customClass = objectPath.get(item, 'custom-class');
		if (customClass) {
			classes += ' ' + customClass;
		}

		if (objectPath.get(item, 'icon-only')) {
			classes += ' kt-menu__item--icon-only';
		}
		return classes;
	}

	/**
	 * Returns Attribute SubMenu Toggle
	 * @param item: any
	 */
	getItemAttrSubmenuToggle(item: any) {
		let toggle = 'hover';
		if (objectPath.get(item, 'toggle') === 'click') {
			toggle = 'click';
		} else if (objectPath.get(item, 'submenu.type') === 'tabs') {
			toggle = 'tabs';
		} else {
			// submenu toggle default to 'hover'
		}
		return toggle;
	}

	/**
	 * Returns Submenu CSS Class Name
	 * @param item: any
	 */
	getItemMenuSubmenuClass(item: any) {
		let classes = '';
		const alignment = objectPath.get(item, 'alignment') || 'right';
		if (alignment) {
			classes += ' kt-menu__submenu--' + alignment;
		}
		const type = objectPath.get(item, 'type') || 'classic';
		if (type === 'classic') {
			classes += ' kt-menu__submenu--classic';
		}
		if (type === 'tabs') {
			classes += ' kt-menu__submenu--tabs';
		}
		if (type === 'mega') {
			if (objectPath.get(item, 'width')) {
				classes += ' kt-menu__submenu--fixed';
			}
		}
		if (objectPath.get(item, 'pull')) {
			classes += ' kt-menu__submenu--pull';
		}
		return classes;
	}

	/**
	 * Check sub menu is active
	 * @param item: any
	 */
	isMenuItemIsActive(item: any): boolean {
		if (item.submenu) {
			return this.isMenuRootItemIsActive(item);
		}
		if (!item.page) {
			return false;
		}
		return this.currentRouteUrl.indexOf(item.page) !== -1;
	}

	/**
	 * Check main menu is active
	 * @param item: any
	 */
	isMenuRootItemIsActive(item: any): boolean { //check từng main menu
		if (item.id == this.menuActive) return true;
		if (item.submenu.items) {
			for (const subItem of item.submenu.items) {
				if (this.isMenuItemIsActive(subItem)) {
					return true;
				}
			}
		}
		if (item.submenu.columns) {
			for (const subItem of item.submenu.columns) {
				if (this.isMenuItemIsActive(subItem)) {
					return true;
				}
			}
		}
		if (typeof item.submenu[Symbol.iterator] === 'function') {
			for (const subItem of item.submenu) {
				const active = this.isMenuItemIsActive(subItem);
				if (active) {
					// this.getMenuItem.emit(item);
					return true;
				}
			}
		}
		return false;
	}
	
	OutputValue(item: any) {
		// let value = {
		// 	item: item,
		// 	init: parentItem
		// }
		item.init = false;
		this.getMenuItem.emit(item);
	}

	checkRootMenu() {
		if (this.currentRouteUrl && this.currentRouteUrl !== "/") {
			this.menuHorService.menuList$.subscribe(res => {
				res.forEach(element => {
					if (element.submenu) {
						element.submenu.forEach((sub: any) => {
							//check như này thì 2 sunmenu ko được có từ giống nhau
							if (this.currentRouteUrl.indexOf(sub.page) !== -1) {
								let item = element;
								item.init = true;
								this.getMenuItem.emit(item);
							}
						});
					}
				});
			})
		}
		else {
			let item = {
				submenu: [
					{						
						title: "Màn hình chính",
						icon: "fa fa-desktop",
						page: "/"
					}
				]
			}
			this.getMenuItem.emit(item);
		}
	}

	onWheel(event: WheelEvent): void {
		let speedScroll = 30;
		if (event.deltaY > 0){
			document.getElementById('kt_header_menu_scroll')!.scrollLeft += speedScroll;
			document.getElementById('kt_header_menu_wrapper')!.scrollTop += speedScroll;
		} 
		else{
			document.getElementById('kt_header_menu_scroll')!.scrollLeft -= speedScroll;
			document.getElementById('kt_header_menu_wrapper')!.scrollTop -= speedScroll;
		} 
		event.preventDefault();
	}
}