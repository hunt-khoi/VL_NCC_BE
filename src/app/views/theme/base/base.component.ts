import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import objectPath from 'object-path';
import { LayoutConfigService, MenuConfigService } from '../../../core/_base/layout';
import { HtmlClassService } from '../html-class.service';
import { LayoutConfig } from '../../../core/_config/layout.config';
import { MenuConfig } from '../../../core/_config/menu.config';

@Component({
	selector: 'kt-base',
	templateUrl: './base.component.html',
	styleUrls: ['./base.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class BaseComponent implements OnInit, OnDestroy {
	// Public variables
	selfLayout: string = "";
	asideDisplay: boolean = false;
	asideSecondary: boolean = false;
	desktopHeaderDisplay: boolean = false;
	subheaderDisplay:boolean = false;
	fitTop: boolean = false;
	fluid: boolean = false;

	// Private properties
	private unsubscribe: Subscription[] = [];

	constructor(
		private layoutConfigService: LayoutConfigService,
		private menuConfigService: MenuConfigService,
		private htmlClassService: HtmlClassService) {

		// register configs by demos
		this.layoutConfigService.loadConfigs(new LayoutConfig().configs);
		this.menuConfigService.loadConfigs(new MenuConfig().configs);

		// setup element classes
		this.htmlClassService.setConfig(this.layoutConfigService.getConfig());
		const subscr = this.layoutConfigService.onConfigUpdated$.subscribe(layoutConfig => {
			// reset body class based on global and page level layout config, refer to html-class.service.ts
			document.body.className = '';
			this.htmlClassService.setConfig(layoutConfig);
		});
		this.unsubscribe.push(subscr);
	}

	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();
		this.selfLayout = objectPath.get(config, 'self.layout');
		this.asideDisplay = objectPath.get(config, 'aside.self.display');
		this.subheaderDisplay = objectPath.get(config, 'subheader.display');

		this.desktopHeaderDisplay = objectPath.get(config, 'header.self.fixed.desktop');
		this.fitTop = objectPath.get(config, 'content.fit-top');
		this.fluid = objectPath.get(config, 'content.width') === 'fluid';

		// let the layout type change
		const subscr = this.layoutConfigService.onConfigUpdated$.subscribe(cfg => {
			setTimeout(() => {
				this.selfLayout = objectPath.get(cfg, 'self.layout');
			});
		});
		this.unsubscribe.push(subscr);
	}

	ngOnDestroy(): void {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}
}