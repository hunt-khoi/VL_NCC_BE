import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

export interface OffcanvasOptions {
	baseClass: string;
	overlay?: boolean;
	closeBy: string;
	toggleBy?: any;
}

@Directive({
	selector: '[ktOffcanvas]',
	exportAs: 'ktOffcanvas',
})
export class OffcanvasDirective implements AfterViewInit {
	// Public properties
	@Input() options: OffcanvasOptions | undefined;
	// Private properties
	private offcanvas: any;

	/**
	 * Directive Constructor
	 * @param el: ElementRef
	 */
	constructor(private el: ElementRef) { }

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
		setTimeout(() => {
			this.offcanvas = new KTOffcanvas(this.el.nativeElement, this.options);
		});
	}

	/**
	 * Returns the offCanvas
	 */
	getOffcanvas() {
		return this.offcanvas;
	}
}