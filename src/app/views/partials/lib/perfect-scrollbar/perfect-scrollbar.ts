/*
 * Thanh cuon perfect-scrollbar.
 *
 * Thay cho thu vien ngx-perfect-scrollbar (da ngung phat trien tu 2022). Boc truc tiep thu vien
 * perfect-scrollbar ma du an da co, giu nguyen selector [perfectScrollbar], input [disabled]
 * va cau hinh mac dinh truoc day khai bao trong AppModule.
 */
import { AfterViewInit, Directive, ElementRef, Input, NgModule, NgZone, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

/** Cau hinh mac dinh, truoc day la PERFECT_SCROLLBAR_CONFIG trong AppModule. */
const DEFAULT_CONFIG: PerfectScrollbar.Options = {
	wheelSpeed: 0.5,
	swipeEasing: true,
	minScrollbarLength: 40,
	maxScrollbarLength: 300,
};

@Directive({
	selector: '[perfectScrollbar]',
	exportAs: 'ngxPerfectScrollbar',
})
export class PerfectScrollbarDirective implements AfterViewInit, OnChanges, OnDestroy {
	/** Cau hinh rieng cho phan tu nay, gop de len cau hinh mac dinh. De trong ('') thi dung mac dinh. */
	@Input() perfectScrollbar: PerfectScrollbar.Options | '' = '';
	/** true thi bo thanh cuon (vi du menu ben trai o che do dropdown). */
	@Input() disabled = false;

	private instance: PerfectScrollbar | null = null;
	private resizeObserver: ResizeObserver | null = null;
	private mutationObserver: MutationObserver | null = null;
	private viewReady = false;

	constructor(private elementRef: ElementRef<HTMLElement>, private zone: NgZone) { }

	ngAfterViewInit(): void {
		this.viewReady = true;
		if (!this.disabled) this.create();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.viewReady) return;
		if (changes.disabled) {
			this.disabled ? this.destroy() : this.create();
		} else if (changes.perfectScrollbar && this.instance) {
			this.destroy();
			this.create();
		}
	}

	update(): void {
		this.instance?.update();
	}

	scrollToTop(): void {
		this.elementRef.nativeElement.scrollTop = 0;
		this.update();
	}

	ngOnDestroy(): void {
		this.destroy();
	}

	private create(): void {
		if (this.instance) return;
		const element = this.elementRef.nativeElement;
		const options = { ...DEFAULT_CONFIG, ...(this.perfectScrollbar || {}) };
		// Chay ngoai Angular de su kien cuon khong kich hoat change detection.
		this.zone.runOutsideAngular(() => {
			this.instance = new PerfectScrollbar(element, options);
			// Cap nhat kich thuoc thanh cuon khi noi dung hoac khung thay doi.
			const update = () => this.instance?.update();
			this.resizeObserver = new ResizeObserver(update);
			this.resizeObserver.observe(element);
			this.mutationObserver = new MutationObserver(update);
			this.mutationObserver.observe(element, { childList: true, subtree: true });
		});
	}

	private destroy(): void {
		this.resizeObserver?.disconnect();
		this.mutationObserver?.disconnect();
		this.resizeObserver = null;
		this.mutationObserver = null;
		this.instance?.destroy();
		this.instance = null;
	}
}

@NgModule({
	declarations: [PerfectScrollbarDirective],
	exports: [PerfectScrollbarDirective],
})
export class PerfectScrollbarModule { }
