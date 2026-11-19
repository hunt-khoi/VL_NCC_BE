/*
 * reCAPTCHA v2 cho man dang nhap.
 *
 * Thay cho thu vien angular2-recaptcha (da ngung phat trien, chi co ban View Engine).
 * Giu nguyen selector, input, output va phuong thuc ma man dang nhap dang dung,
 * va cung mot cach nap script cua Google nhu thu vien cu.
 */
import { Component, ElementRef, EventEmitter, Injectable, Input, NgModule, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

declare global {
	interface Window {
		grecaptcha: any;
		reCaptchaOnloadCallback: () => void;
	}
}

/** Nap script reCAPTCHA mot lan cho ca ung dung. Ngon ngu lay theo lan nap dau tien (gioi han cua Google). */
@Injectable({ providedIn: 'root' })
export class ReCaptchaService {
	private scriptLoaded = false;
	private readonly ready = new BehaviorSubject<boolean>(false);

	constructor(zone: NgZone) {
		window.reCaptchaOnloadCallback = () => zone.run(() => this.ready.next(true));
	}

	whenReady(language?: string | null): Observable<boolean> {
		if (!this.scriptLoaded) {
			this.scriptLoaded = true;
			const script = document.createElement('script');
			script.src = 'https://www.google.com/recaptcha/api.js?onload=reCaptchaOnloadCallback&render=explicit'
				+ (language ? '&hl=' + language : '');
			script.async = true;
			script.defer = true;
			document.body.appendChild(script);
		}
		return this.ready.pipe(filter(ready => ready), take(1));
	}
}

@Component({
	selector: 're-captcha',
	template: '<div #target></div>',
})
export class ReCaptchaComponent implements OnInit {
	@Input() site_key: string | null = null;
	@Input() theme = 'light';
	@Input() type = 'image';
	@Input() size = 'normal';
	@Input() tabindex = 0;
	@Input() badge = 'bottomright';
	@Input() language: string | null = null;
	@Output() captchaResponse = new EventEmitter<string>();
	@Output() captchaExpired = new EventEmitter<void>();
	@ViewChild('target', { static: true }) targetRef!: ElementRef<HTMLElement>;

	private widgetId: number | null = null;

	constructor(private zone: NgZone, private captchaService: ReCaptchaService) { }

	ngOnInit(): void {
		this.captchaService.whenReady(this.language).subscribe(() => {
			this.widgetId = window.grecaptcha.render(this.targetRef.nativeElement, {
				sitekey: this.site_key,
				badge: this.badge,
				theme: this.theme,
				type: this.type,
				size: this.size,
				tabindex: this.tabindex,
				callback: (response: string) => this.zone.run(() => this.captchaResponse.emit(response)),
				'expired-callback': () => this.zone.run(() => this.captchaExpired.emit()),
			});
		});
	}

	reset(): void {
		if (this.widgetId !== null) window.grecaptcha.reset(this.widgetId);
	}

	execute(): void {
		if (this.widgetId !== null) window.grecaptcha.execute(this.widgetId);
	}

	getResponse(): string | null {
		return this.widgetId === null ? null : window.grecaptcha.getResponse(this.widgetId);
	}
}

@NgModule({
	declarations: [ReCaptchaComponent],
	exports: [ReCaptchaComponent],
})
export class ReCaptchaModule { }
