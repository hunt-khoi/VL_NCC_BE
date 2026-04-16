import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[ktContentAnimate]'
})
export class ContentAnimateDirective implements OnInit, OnDestroy {
	// Public properties
	player: AnimationPlayer | undefined;
	// Private properties
	private events: Subscription | undefined;

	/**
	 * Directive Consturctor
	 * @param el: ElementRef
	 * @param router: Router
	 * @param animationBuilder: AnimationBuilder
	 */
	constructor(
		private el: ElementRef,
		private router: Router,
		private animationBuilder: AnimationBuilder) {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
		// animate the content
		this.initAnimate();
		// animate page load
		this.events = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				if (this.player)
					this.player.play();
			}
		});
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		if (this.events) 
			this.events.unsubscribe();
		if (this.player) 
			this.player.destroy();
	}

	/**
	 * Animate page load
	 */
	initAnimate() {
		this.player = this.animationBuilder
			.build([
				style({
					transform: 'translateY(-3%)',
					opacity: 0,
					position: 'static'
				}),
				animate(
					'0.5s ease-in-out',
					style({transform: 'translateY(0%)', opacity: 1})
				)
			])
			.create(this.el.nativeElement);
	}
}