import { Component, OnInit } from '@angular/core';
import { LayoutConfigService } from '../../../core/_base/layout';
import objectPath from 'object-path';

@Component({
	selector: 'kt-subheader',
	templateUrl: './subheader.component.html',
})
export class SubheaderComponent implements OnInit {
	// Public properties
	layout: string = "";
	fluid: boolean = false;
	clear: boolean = false;
	
	constructor(private layoutConfigService: LayoutConfigService) { }

	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();
		this.layout = objectPath.get(config, 'subheader.layout');
		this.fluid = objectPath.get(config, 'footer.self.width') === 'fluid';
		this.clear = objectPath.get(config, 'subheader.clear');
	}
}