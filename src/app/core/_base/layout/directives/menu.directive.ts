import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import * as objectPath from 'object-path';

export interface MenuOptions {
	scroll?: any;
	submenu?: any;
	accordion?: any;
	dropdown?: any;
}

@Directive({
	selector: '[ktMenu]',
	exportAs: 'ktMenu',
})
export class MenuDirective implements AfterViewInit {
	@Input() options: MenuOptions | undefined;
	private menu: any;

	constructor(private el: ElementRef) { }

	ngAfterViewInit(): void {
		this.setupOptions();
		this.menu = new KTMenu(this.el.nativeElement, this.options);
	}

	getMenu() {
		return this.menu;
	}

	private setupOptions() {
		// init aside menu
		let menuDesktopMode = 'accordion';
		if (this.el.nativeElement.getAttribute('data-ktmenu-dropdown') === '1') {
			menuDesktopMode = 'dropdown';
		}
		if (this.options) {
			if (typeof objectPath.get(this.options, 'submenu.desktop') === 'object') {
				objectPath.set(this.options, 'submenu.desktop', menuDesktopMode);
			}
		}
	}
}