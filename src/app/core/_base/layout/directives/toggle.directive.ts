import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

export interface ToggleOptions {
	target?: string;
	targetState?: string;
	togglerState?: string;
}

@Directive({
	selector: '[ktToggle]',
	exportAs: 'ktToggle'
})
export class ToggleDirective implements AfterViewInit {
	// Public properties
	@Input() options: ToggleOptions | undefined;
	toggle: any;

	/**
	 * Directive constructor
	 * @param el: ElementRef
	 */
	constructor(private el: ElementRef) { }

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
		this.toggle = new KTToggle(this.el.nativeElement, this.options);
	}
}