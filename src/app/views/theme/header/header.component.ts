import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import objectPath from 'object-path';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LayoutConfigService, LayoutRefService } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';

@Component({
	selector: 'kt-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit, AfterViewInit {
	// Public properties
	menuHeaderDisplay: boolean = false;
	subheaderDisplay: boolean = false;
	dataSubmenu:any;
	fluid: boolean = false;
	fluid_sub: boolean = false;
	constants:any;
	clear: boolean = false;
	currentRouteUrl: any = '';
	activeMenu: number = 0;
	@ViewChild('ktHeader', {static: true}) ktHeader: ElementRef | undefined;

	constructor(
		private router: Router,
		private layoutRefService: LayoutRefService,
		private layoutConfigService: LayoutConfigService,
		public loader: LoadingBarService,
		public htmlClassService: HtmlClassService) {
			// page progress bar percentage
			this.router.events.subscribe(event => {
				if (event instanceof NavigationStart) {
					// set page progress bar loading to start on NavigationStart event router
					this.loader.start();
				}
				if (event instanceof RouteConfigLoadStart) {
					this.loader.increment(35);
				}
				if (event instanceof RouteConfigLoadEnd) {
					this.loader.increment(75);
				}
				if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
					// set page progress bar loading to end on NavigationEnd event router
					this.loader.complete();
				}
			});
	}

	ngOnInit(): void {
		this.currentRouteUrl = this.router.url;
		const config = this.layoutConfigService.getConfig();
		this.constants = this.layoutConfigService.getConfig('constants');;
		// get menu header display option
		this.menuHeaderDisplay = objectPath.get(config, 'header.menu.self.display');
		this.subheaderDisplay = objectPath.get(config, 'subheader.display');
		// header width fluid
		this.fluid = objectPath.get(config, 'header.self.width') === 'fluid';
		this.fluid_sub = objectPath.get(config, 'footer.self.width') === 'fluid';
		this.clear = objectPath.get(config, 'subheader.clear');
		// animate the header minimize the height on scroll down
		if (this.ktHeader) {
			if (objectPath.get(config, 'header.self.fixed.desktop.enabled') || objectPath.get(config, 'header.self.fixed.desktop')) {
				// header minimize on scroll down
				this.ktHeader.nativeElement.setAttribute('data-ktheader-minimize', '1');
			}
		}
	}

	ngAfterViewInit(): void {
		// keep header element in the service
		if (this.ktHeader)
			this.layoutRefService.addElement('header', this.ktHeader.nativeElement);
	}

	/**********Load Submenu Header********/
	getActiveHeader(event: any){
		this.dataSubmenu = event.submenu;
		this.activeMenu= event.id ? event.id : 0;
		if (this.dataSubmenu && this.dataSubmenu.length>0 && !event.init){
			//init true là lấy link hiện tại của trang khi reload trang, false: chuyển tab menu
			this.router.navigateByUrl(this.dataSubmenu[0].page);
		}		
	}	
}