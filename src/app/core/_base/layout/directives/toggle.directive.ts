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
	@Input() options: ToggleOptions | undefined;
	toggle: any;

	constructor(private el: ElementRef) { }

	ngAfterViewInit(): void {
		this.toggle = new KTToggle(this.el.nativeElement, this.options);
	}
}