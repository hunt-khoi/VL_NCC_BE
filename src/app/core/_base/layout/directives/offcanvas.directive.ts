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
	@Input() options: OffcanvasOptions | undefined;
	private offcanvas: any;

	constructor(private el: ElementRef) { }

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.offcanvas = new KTOffcanvas(this.el.nativeElement, this.options);
		});
	}

	getOffcanvas() {
		return this.offcanvas;
	}
}