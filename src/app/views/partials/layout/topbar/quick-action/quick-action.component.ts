import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'kt-quick-action',
	templateUrl: './quick-action.component.html',
})
export class QuickActionComponent implements OnInit {
	// Public properties
	// Set icon class name
	@Input() icon = 'flaticon2-gear';
	@Input() iconType: "" | "warning" = "";
	@Input() useSVG: boolean = false;
	// Set bg image path
	@Input() bgImage: string = "";
	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';
	@Input() gridNavSkin: 'light' | 'dark' = 'light';

	constructor() { }

	ngOnInit(): void { }

	onSVGInserted(svg: any) {
		svg.classList.add('kt-svg-icon', 'kt-svg-icon--success', 'kt-svg-icon--lg');
	}
}