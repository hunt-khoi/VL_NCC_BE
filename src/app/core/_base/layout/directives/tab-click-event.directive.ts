import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
	selector: '[ktTabClickEvent]'
})
export class TabClickEventDirective {

	constructor(private el: ElementRef, private render: Renderer2) { }

	@HostListener('click', ['$event.target'])
	onClick(target: HTMLElement) {
		// remove previous active tab
		const parent = target.closest('[role="tablist"]');
		if (!parent) return;
		const activeLink = parent.querySelector('[role="tab"].active');
		if (activeLink) {
			this.render.removeClass(activeLink, 'active');
		}
		// set active tab
		const link = target.closest('[role="tab"]');
		if (link) {
			this.render.addClass(link, 'active');
		}
	}
}