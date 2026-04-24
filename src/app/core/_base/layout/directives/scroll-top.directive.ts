import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

export interface ScrollTopOptions {
	offset: number;
	speed: number;
}

@Directive({
	selector: '[ktScrollTop]'
})
export class ScrollTopDirective implements AfterViewInit {
	@Input() options: ScrollTopOptions | undefined;
	private scrollTop: any;

	constructor(private el: ElementRef) { }

	ngAfterViewInit(): void {
		this.scrollTop = new KTScrolltop(this.el.nativeElement, this.options);
	}

	getScrollTop() {
		return this.scrollTop;
	}
}