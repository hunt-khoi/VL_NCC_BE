import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

export interface ScrollTopOptions {
	offset: number;
	speed: number;
}

@Directive({
	selector: '[ktScrollTop]'
})
export class ScrollTopDirective implements AfterViewInit {
	// Public properties
	@Input() options: ScrollTopOptions | undefined;
	// Private properites
	private scrollTop: any;

	/**
	 * Directive Conctructor
	 * @param el: ElementRef
	 */
	constructor(private el: ElementRef) { }

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
		this.scrollTop = new KTScrolltop(this.el.nativeElement, this.options);
	}

	/**
	 * Returns ScrollTop
	 */
	getScrollTop() {
		return this.scrollTop;
	}
}