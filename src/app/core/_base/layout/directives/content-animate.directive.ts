import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { animate, AnimationBuilder, AnimationPlayer, style } from '@angular/animations';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Directive({
	selector: '[ktContentAnimate]'
})
export class ContentAnimateDirective implements OnInit, OnDestroy {
	player: AnimationPlayer | undefined;
	private events: Subscription | undefined;

	constructor(
		private el: ElementRef,
		private router: Router,
		private animationBuilder: AnimationBuilder) {
	}

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

	ngOnDestroy(): void {
		if (this.events) 
			this.events.unsubscribe();
		if (this.player) 
			this.player.destroy();
	}

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