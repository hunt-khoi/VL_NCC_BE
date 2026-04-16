import { Component, Input, OnDestroy, ChangeDetectorRef, OnChanges, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HtmlClassService } from '../../html-class.service';
import { MenuHorizontalService } from 'app/core/_base/layout';
import { Router, NavigationEnd } from '@angular/router';
import { QueryParamsModel } from 'app/core/_base/crud';

@Component({
	selector: 'kt-subheader-tab',
	templateUrl: './subheader-tab.component.html',
	styleUrls: ['./subheader-tab.component.scss'],
})

export class SubheaderTabComponent implements OnChanges, OnDestroy {
	// Public properties
	@Input() fluid: boolean = false;
	@Input() clear: boolean = false;
	@Input() data: any;
	@Input() menuId: number = 0;
	today: number = Date.now();
	currentRouteUrl: any = '';
	collapse: boolean = false;
	
	// Private properties
	private subscriptions: Subscription[] = [];

	constructor(
		public htmlClassService: HtmlClassService,
		public menuHorService: MenuHorizontalService,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private render: Renderer2) {
	}

	ngOnChanges() {
		this.menuHorService.activeMenu$ = this.menuId;
		let queryParams = new QueryParamsModel({});
		this.menuHorService.getSubMenu(queryParams);
		this.menuHorService.quantitySubmenu$.subscribe(res=>{
			this.data = res;
			this.cdr.detectChanges();
		})
		this.currentRouteUrl = this.router.url;
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(_ => {
				this.currentRouteUrl = this.router.url;
				this.cdr.markForCheck();				
			});			
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(sb => sb.unsubscribe());
	}

	getItemCssClasses(item: any) {
		if(this.isMenuItemIsActive(item)){
			return "active";
		}
		return "";
	}

	isMenuItemIsActive(item: any): boolean {
		// if (item.submenu) {
		// 	return this.isMenuRootItemIsActive(item);
		// }
		if (!item.page) {
			return false;
		}
		return this.currentRouteUrl.indexOf(item.page) !== -1;
	}

	collapseSubmenu(){
		this.collapse=!this.collapse;
		if (this.collapse)
			this.render.addClass(document.body, 'subheader-collapse');
		else
			this.render.removeClass(document.body, 'subheader-collapse');
			
		let ele=(<HTMLInputElement>document.getElementById('kt_content'));
		ele.style.maxHeight=this.htmlClassService.getContentHeight();
	}

	onWheel(event: WheelEvent): void {
		let speedScroll = 30;
		if (event.deltaY > 0) document.getElementById('container')!.scrollLeft += speedScroll;
		else document.getElementById('container')!.scrollLeft -= speedScroll;
		event.preventDefault();
	}
}