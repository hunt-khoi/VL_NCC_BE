/*
 * Popover dung cho hop binh luan.
 *
 * Chep tu thu vien ngx-smart-popover 1.5.0 (https://github.com/lsqlabs/ngx-smart-popover),
 * giay phep MIT, ban quyen thuoc cac tac gia cua thu vien. Thu vien da ngung phat trien va chi co
 * ban View Engine, khong dung duoc tu Angular 16. Giu nguyen selector, class CSS va API de template
 * va giao dien khong doi; chi doi metadata View Engine thanh decorator va bo ComponentFactoryResolver.
 */
/* eslint-disable */
import {
  ApplicationRef, ChangeDetectorRef, Component, Directive, ElementRef, EventEmitter, HostListener,
  Input, NgModule, Output, Renderer2, SimpleChanges, ViewChild, ViewContainerRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export class PopoverPlacement {
	static Bottom = 'bottom';
	static BottomLeft = 'bottom-left';
	static BottomRight = 'bottom-right';
	static Left = 'left';
	static Right = 'right';
	static Top = 'top';
	static TopLeft = 'top-left';
	static TopRight = 'top-right';
}

@Component({
    selector: 'popover-content',
    template: ``,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PopoverContentComponent {
	[key: string]: any;
	@Input() content: any;
	@Input() placement: any;
	@Input() title: any;
	@Input() parentClass: any;
	@Input() animation: any;
	@Input() closeOnClickOutside: any;
	@Input() closeOnMouseOutside: any;
	@Input() appendToBody: any;
	@Input() size: any;
	@ViewChild('popoverDiv', { static: true }) popoverDiv: any;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    
    constructor(public element: ElementRef, public cdr: ChangeDetectorRef, public renderer: Renderer2) {
        this.element = element;
        this.cdr = cdr;
        this.renderer = renderer;
        this.placement = PopoverPlacement.Top;
        this.animation = true;
        this.closeOnClickOutside = false;
        this.closeOnMouseOutside = false;
        this.appendToBody = false;
        this.size = 'small';
        this.onCloseFromOutside = new EventEmitter();
        this.top = -10000;
        this.left = -10000;
        this.isIn = false;
        this.opacity = 0;
        this.transitionEnabled = false;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        // -------------------------------------------------------------------------
        // Anonymous
        // -------------------------------------------------------------------------
        
        this.onDocumentMouseDown = (
        (event) => {
            
            const element = this.element.nativeElement;
            if (!element || !this.popover) {
                return;
            }
            if (element.contains(event.target) || this.popover.getElement().contains(event.target)) {
                return;
            }
            this.onCloseFromOutside.emit(undefined);
        });
    }
    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------
    
    ngAfterViewInit() {
        if (this.closeOnClickOutside) {
            this.listenClickFunc = this.renderer.listen('document', 'mousedown', (
            (event) => this.onDocumentMouseDown(event)));
        }
        if (this.closeOnMouseOutside) {
            this.listenMouseFunc = this.renderer.listen('document', 'mouseover', (
            (event) => this.onDocumentMouseDown(event)));
        }
        // Always close on mobile touch event outside.
        this.listenTouchFunc = this.renderer.listen('document', 'touchstart', (
        (event) => this.onDocumentMouseDown(event)));
        this.show();
        this.cdr.detectChanges();
    }
    
    ngOnDestroy() {
        if (this.closeOnClickOutside && this.listenClickFunc) {
            this.listenClickFunc();
        }
        if (this.closeOnMouseOutside && this.listenMouseFunc) {
            this.listenMouseFunc();
        }
        if (!!this.listenTouchFunc) {
            this.listenTouchFunc();
        }
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    
    @HostListener('window:resize', ['$event'])
    
    onResize(event: any) {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
    }
    
    updatePosition() {
        // if visible, reposition
        if (this.opacity) {
            
            const p = this.positionElements(this.popover.getElement(), this.popoverDiv.nativeElement, this.placement);
            this.top = p.top;
            this.left = p.left;
        }
    }
    
    show() {
        if (!this.popover || !this.popover.getElement()) {
            return;
        }
        
        const p = this.positionElements(this.popover.getElement(), this.popoverDiv.nativeElement, this.placement);
        this.top = p.top;
        this.left = p.left;
        this.isIn = true;
        this.transitionEnabled = true;
        this.opacity = 1;
    }
    
    hide() {
        this.top = -10000;
        this.left = -10000;
        this.isIn = true;
        this.popover.hide();
    }
    
    hideFromPopover() {
        this.top = -10000;
        this.left = -10000;
        this.isIn = true;
        this.transitionEnabled = false;
        this.opacity = 0;
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    
    positionElements(hostEl: any, targetEl: any, positionStr: any, appendToBody = false): any {
        
        const positionStrParts = (( (positionStr))).split(' ');
        
        let pos0 = positionStrParts[0];
        
        const pos1 = positionStrParts[1] || 'center';
        
        const hostElPos = this.appendToBody || appendToBody ? this.offset(hostEl) : this.position(hostEl);
        
        const targetElWidth = targetEl.offsetWidth;
        
        const targetElHeight = targetEl.offsetHeight;
        this.effectivePlacement = pos0 = this.getEffectivePlacement(pos0, hostEl, targetEl);
        
        const shiftWidth: any = {
            center: (
            function () {
                return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            }),
            left: (
            function () {
                return hostElPos.left;
            }),
            right: (
            function () {
                return hostElPos.left + hostElPos.width;
            }),
            topOrBottomRight: (
            function () {
                return hostElPos.left + hostElPos.width / 2;
            }),
            topOrBottomLeft: (
            function () {
                return hostElPos.left - targetElWidth + hostElPos.width / 2;
            })
        };
        
        const shiftHeight: any = {
            center: (
            function () {
                return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            }),
            top: (
            function () {
                return hostElPos.top;
            }),
            bottom: (
            function () {
                return hostElPos.top + hostElPos.height;
            })
        };
        
        let targetElPos;
        switch (pos0) {
            case PopoverPlacement.Right:
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: shiftWidth[pos0]()
                };
                break;
            case PopoverPlacement.Left:
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: hostElPos.left - targetElWidth
                };
                break;
            case PopoverPlacement.Bottom:
                targetElPos = {
                    top: shiftHeight[pos0](),
                    left: shiftWidth[pos1]()
                };
                break;
            case PopoverPlacement.TopLeft:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth['topOrBottomLeft']()
                };
                break;
            case PopoverPlacement.TopRight:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth['topOrBottomRight']()
                };
                break;
            case PopoverPlacement.BottomLeft:
                targetElPos = {
                    top: shiftHeight[PopoverPlacement.Bottom](),
                    left: shiftWidth['topOrBottomLeft']()
                };
                break;
            case PopoverPlacement.BottomRight:
                targetElPos = {
                    top: shiftHeight[PopoverPlacement.Bottom](),
                    left: shiftWidth['topOrBottomRight']()
                };
                break;
            default:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth[pos1]()
                };
                break;
        }
        return targetElPos;
    }
    
    position(nativeEl) {
        
        let offsetParentBCR: any = { top: 0, left: 0 };
        
        const elBCR = this.offset(nativeEl);
        
        const offsetParentEl = this.parentOffsetEl(nativeEl);
        if (offsetParentEl !== window.document) {
            offsetParentBCR = this.offset(offsetParentEl);
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: elBCR.top - offsetParentBCR.top,
            left: elBCR.left - offsetParentBCR.left
        };
    }
    
    offset(nativeEl) {
        
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
            left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }
    
    getStyle(nativeEl, cssProp) {
        if ((( (nativeEl))).currentStyle) { // IE
            return (( (nativeEl))).currentStyle[cssProp];
        }
        if (window.getComputedStyle) {
            return (( (window.getComputedStyle)))(nativeEl)[cssProp];
        }
        // finally try and get inline style
        return (( (nativeEl.style)))[cssProp];
    }
    
    isStaticPositioned(nativeEl) {
        return (this.getStyle(nativeEl, 'position') || 'static') === 'static';
    }
    
    parentOffsetEl(nativeEl) {
        
        let offsetParent = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }
    // Check for overflow of the viewport and reflect the position if necessary.
    
    getEffectivePlacement(placement, hostElement, targetElement) {
        
        const hostElBoundingRect = hostElement.getBoundingClientRect();
        
        const desiredPlacement = placement || PopoverPlacement.Top;
        // Determines if a popover overflows in a direction when in a specific position.
        
        const overflows = {
            positionTop: {
                top: hostElBoundingRect.top - targetElement.offsetHeight < 0,
                right: hostElBoundingRect.left + hostElBoundingRect.width / 2 + targetElement.offsetWidth / 2 > this.windowWidth,
                left: hostElBoundingRect.left + hostElBoundingRect.width / 2 - targetElement.offsetWidth / 2 < 0
            },
            positionTopRight: {
                top: hostElBoundingRect.top - targetElement.offsetHeight < 0,
                right: hostElBoundingRect.right + targetElement.offsetWidth > this.windowWidth
            },
            positionRight: {
                top: hostElBoundingRect.top + hostElBoundingRect.height / 2 - targetElement.offsetHeight / 2 < 0,
                right: hostElBoundingRect.right + targetElement.offsetWidth > this.windowWidth,
                bottom: hostElBoundingRect.top + hostElBoundingRect.height / 2 + targetElement.offsetHeight / 2 > this.windowHeight
            },
            positionBottomRight: {
                right: hostElBoundingRect.right + targetElement.offsetWidth > this.windowWidth,
                bottom: hostElBoundingRect.bottom + targetElement.offsetHeight > this.windowHeight
            },
            positionBottom: {
                right: hostElBoundingRect.left + hostElBoundingRect.width / 2 + targetElement.offsetWidth / 2 > this.windowWidth,
                bottom: hostElBoundingRect.bottom + targetElement.offsetHeight > this.windowHeight,
                left: hostElBoundingRect.left + hostElBoundingRect.width / 2 - targetElement.offsetWidth / 2 < 0
            },
            positionBottomLeft: {
                bottom: hostElBoundingRect.bottom + targetElement.offsetHeight > this.windowHeight,
                left: hostElBoundingRect.left - targetElement.offsetWidth < 0
            },
            positionLeft: {
                left: hostElBoundingRect.left < targetElement.offsetWidth,
                top: hostElBoundingRect.top + hostElBoundingRect.height / 2 - targetElement.offsetHeight / 2 < 0,
                bottom: hostElBoundingRect.top + hostElBoundingRect.height / 2 + targetElement.offsetHeight / 2 > this.windowHeight
            },
            positionTopLeft: {
                top: hostElBoundingRect.top - targetElement.offsetHeight < 0,
                left: hostElBoundingRect.left - targetElement.offsetWidth < 0
            }
        };
        if (desiredPlacement === PopoverPlacement.Top) {
            // If it overflows on the top AND left, go to bottom-right.
            if (overflows.positionTop.top && overflows.positionTop.left) {
                return PopoverPlacement.BottomRight;
                // If it overflows on the top AND right, go to bottom-left.
            }
            else if (overflows.positionTop.top && overflows.positionTop.right) {
                return PopoverPlacement.BottomLeft;
                // If it only overflows on the top, go to bottom.
            }
            else if (overflows.positionTop.top) {
                return PopoverPlacement.Bottom;
                // If it only overflows to the right, go to top-left.
            }
            else if (overflows.positionTop.right) {
                return PopoverPlacement.TopLeft;
                // If it only overflows to the left, go to top-right.
            }
            else if (overflows.positionTop.left) {
                return PopoverPlacement.TopRight;
            }
            else {
                return PopoverPlacement.Top;
            }
        }
        if (desiredPlacement === PopoverPlacement.TopRight) {
            // If it overflows on the top AND the right, try in the order: bottom, Bottom-left, left.
            if (overflows.positionTopRight.top && overflows.positionTopRight.right) {
                if (overflows.positionBottom.bottom) {
                    return PopoverPlacement.Left;
                }
                else if (overflows.positionBottom.right) {
                    return PopoverPlacement.BottomLeft;
                }
                else {
                    return PopoverPlacement.Bottom;
                }
                // If it only overflows on the top, try in the order: right, bottom-right.
            }
            else if (overflows.positionTopRight.top) {
                if (overflows.positionRight.top) {
                    return PopoverPlacement.BottomRight;
                }
                else {
                    return PopoverPlacement.Right;
                }
                // If it only overflows on the right, try in the order: top, top-left.
            }
            else if (overflows.positionTopRight.right) {
                if (overflows.positionTop.right) {
                    return PopoverPlacement.TopLeft;
                }
                else {
                    return PopoverPlacement.Top;
                }
            }
            else {
                return PopoverPlacement.TopRight;
            }
        }
        if (desiredPlacement === PopoverPlacement.Right) {
            // If it overflows on the right AND the top, try in the order: bottom-right, bottom, bottom-left.
            if (overflows.positionRight.right && overflows.positionRight.top) {
                if (overflows.positionBottomRight.right && overflows.positionBottom.right) {
                    return PopoverPlacement.BottomLeft;
                }
                else if (overflows.positionBottomRight.right) {
                    return PopoverPlacement.Bottom;
                }
                else {
                    return PopoverPlacement.BottomRight;
                }
                // If it overflows on the right AND the bottom, try in the order: top-right, top, top-left.
            }
            else if (overflows.positionRight.right && overflows.positionRight.bottom) {
                if (overflows.positionTopRight.right && overflows.positionTop.right) {
                    return PopoverPlacement.TopLeft;
                }
                else if (overflows.positionTopRight.right) {
                    return PopoverPlacement.Top;
                }
                else {
                    return PopoverPlacement.TopRight;
                }
                // If it only overflows on the right, try all top positions from right to left, then try all bottom positions right to left.
            }
            else if (overflows.positionRight.right) {
                if (overflows.positionTop.top) {
                    if (overflows.positionBottom.right) {
                        return PopoverPlacement.BottomLeft;
                    }
                    else if (overflows.positionBottomRight.right) {
                        return PopoverPlacement.Bottom;
                    }
                    else {
                        return PopoverPlacement.BottomRight;
                    }
                }
                else {
                    if (overflows.positionTop.right) {
                        return PopoverPlacement.TopLeft;
                    }
                    else if (overflows.positionTopRight.right) {
                        return PopoverPlacement.Top;
                    }
                    else {
                        return PopoverPlacement.TopRight;
                    }
                }
                // If it only over flows on the top, go bottom-right.
            }
            else if (overflows.positionRight.top) {
                return PopoverPlacement.BottomRight;
                // If it only overflows on the bottom, go top-right.
            }
            else if (overflows.positionRight.bottom) {
                return PopoverPlacement.TopRight;
            }
            else {
                return PopoverPlacement.Right;
            }
        }
        if (desiredPlacement === PopoverPlacement.BottomRight) {
            // If it overflows on the bottom AND the right, try in the order: top, top-left, left.
            if (overflows.positionBottomRight.bottom && overflows.positionBottomRight.right) {
                if (overflows.positionTop.top) {
                    return PopoverPlacement.Left;
                }
                else if (overflows.positionTop.right) {
                    return PopoverPlacement.TopLeft;
                }
                else {
                    return PopoverPlacement.Top;
                }
                // If it only overflows on the bottom, try in the order: right, top-right.
            }
            else if (overflows.positionBottomRight.bottom) {
                if (overflows.positionRight.bottom) {
                    return PopoverPlacement.TopRight;
                }
                else {
                    return PopoverPlacement.Right;
                }
                // If it only overflows on the right, try in the order: bottom, bottom-left.
            }
            else if (overflows.positionBottomRight.right) {
                if (overflows.positionBottom.right) {
                    return PopoverPlacement.BottomLeft;
                }
                else {
                    return PopoverPlacement.Bottom;
                }
            }
            else {
                return PopoverPlacement.BottomRight;
            }
        }
        if (desiredPlacement === PopoverPlacement.Bottom) {
            // If it overflows on the bottom AND left, go to top-right.
            if (overflows.positionBottom.bottom && overflows.positionBottom.left) {
                return PopoverPlacement.TopRight;
                // If it overflows on the bottom AND right, go to top-left.
            }
            else if (overflows.positionBottom.bottom && overflows.positionBottom.right) {
                return PopoverPlacement.TopLeft;
                // If it only overflows on the bottom, go to top.
            }
            else if (overflows.positionBottom.bottom) {
                return PopoverPlacement.Top;
                // If it only overflows to the right, go to bottom-left.
            }
            else if (overflows.positionBottom.right) {
                return PopoverPlacement.BottomLeft;
                // If it only overflows to the left, go to bottom-right.
            }
            else if (overflows.positionBottom.left) {
                return PopoverPlacement.BottomRight;
            }
            else {
                return PopoverPlacement.Bottom;
            }
        }
        if (desiredPlacement === PopoverPlacement.BottomLeft) {
            // If it overflows on the bottom AND the left, try in the order: top, top-right, right.
            if (overflows.positionBottomLeft.bottom && overflows.positionBottomLeft.left) {
                if (overflows.positionTop.top) {
                    return PopoverPlacement.Right;
                }
                else if (overflows.positionTop.left) {
                    return PopoverPlacement.TopRight;
                }
                else {
                    return PopoverPlacement.Top;
                }
                // If it only overflows on the bottom, try in the order: left, top-left.
            }
            else if (overflows.positionBottomLeft.bottom) {
                if (overflows.positionLeft.bottom) {
                    return PopoverPlacement.TopLeft;
                }
                else {
                    return PopoverPlacement.Left;
                }
                // If it only overflows on the left, try in the order: bottom, bottom-right.
            }
            else if (overflows.positionBottomLeft.left) {
                if (overflows.positionBottom.left) {
                    return PopoverPlacement.BottomRight;
                }
                else {
                    return PopoverPlacement.Bottom;
                }
            }
            else {
                return PopoverPlacement.BottomLeft;
            }
        }
        if (desiredPlacement === PopoverPlacement.Left) {
            // If it overflows on the left AND the top, try in the order: bottom-left, bottom, bottom-right.
            if (overflows.positionLeft.left && overflows.positionLeft.top) {
                if (overflows.positionBottomLeft.left && overflows.positionBottom.left) {
                    return PopoverPlacement.BottomRight;
                }
                else if (overflows.positionBottomRight.right) {
                    return PopoverPlacement.Bottom;
                }
                else {
                    return PopoverPlacement.BottomLeft;
                }
                // If it overflows on the left AND the bottom, try in the order: top-left, top, top-right.
            }
            else if (overflows.positionLeft.left && overflows.positionLeft.bottom) {
                if (overflows.positionTopLeft.left && overflows.positionTop.left) {
                    return PopoverPlacement.TopRight;
                }
                else if (overflows.positionTopLeft.left) {
                    return PopoverPlacement.Top;
                }
                else {
                    return PopoverPlacement.TopLeft;
                }
                // If it only overflows on the left, try all top positions from left to right, then try all bottom positions left to right.
            }
            else if (overflows.positionLeft.left) {
                if (overflows.positionTop.top) {
                    if (overflows.positionBottom.left) {
                        return PopoverPlacement.BottomRight;
                    }
                    else if (overflows.positionBottomLeft.left) {
                        return PopoverPlacement.Bottom;
                    }
                    else {
                        return PopoverPlacement.BottomLeft;
                    }
                }
                else {
                    if (overflows.positionTop.left) {
                        return PopoverPlacement.TopRight;
                    }
                    else if (overflows.positionTopLeft.left) {
                        return PopoverPlacement.Top;
                    }
                    else {
                        return PopoverPlacement.TopLeft;
                    }
                }
                // If it only over flows on the top, go bottom-left.
            }
            else if (overflows.positionLeft.top) {
                return PopoverPlacement.BottomLeft;
                // If it only overflows on the bottom, go top-left.
            }
            else if (overflows.positionLeft.bottom) {
                return PopoverPlacement.TopLeft;
            }
            else {
                return PopoverPlacement.Left;
            }
        }
        if (desiredPlacement === PopoverPlacement.TopLeft) {
            // If it overflows on the top AND the left, try in the order: bottom, Bottom-right, right.
            if (overflows.positionTopLeft.top && overflows.positionTopLeft.left) {
                if (overflows.positionBottom.bottom) {
                    return PopoverPlacement.Right;
                }
                else if (overflows.positionBottom.left) {
                    return PopoverPlacement.BottomRight;
                }
                else {
                    return PopoverPlacement.Bottom;
                }
                // If it only overflows on the top, try in the order: left, bottom-left.
            }
            else if (overflows.positionTopLeft.top) {
                if (overflows.positionLeft.top) {
                    return PopoverPlacement.BottomLeft;
                }
                else {
                    return PopoverPlacement.Left;
                }
                // If it only overflows on the left, try in the order: top, top-right.
            }
            else if (overflows.positionTopLeft.left) {
                if (overflows.positionTop.left) {
                    return PopoverPlacement.TopRight;
                }
                else {
                    return PopoverPlacement.Top;
                }
            }
            else {
                return PopoverPlacement.TopLeft;
            }
        }
        return desiredPlacement;
    }
}

@Directive({
    selector: '[popover]',
    exportAs: 'popover',
    standalone: false
})
export class PopoverDirective {
	[key: string]: any;
	@Input('popover') content: any;
	@Input() popoverSize: any;
	@Input() popoverDisabled: any;
	@Input() popoverAnimation: any;
	@Input() popoverPlacement: any;
	@Input() popoverTitle: any;
	@Input() popoverOnHover: any;
	@Input() popoverCloseOnClickOutside: any;
	@Input() popoverCloseOnMouseOutside: any;
	@Input() popoverDismissTimeout: any;
	@Input() appendToBody: any;
	@Output() onShown: EventEmitter<any>;
	@Output() onHidden: EventEmitter<any>;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    
    constructor(public viewContainerRef: ViewContainerRef, public cdr: ChangeDetectorRef, public appRef: ApplicationRef) {
        this.viewContainerRef = viewContainerRef;
        this.cdr = cdr;
        this.appRef = appRef;
        // -------------------------------------------------------------------------
        // Properties
        // -------------------------------------------------------------------------
        this.popoverContentComponent = PopoverContentComponent;
        this.popoverOnHover = true;
        this.popoverDismissTimeout = 0;
        this.onShown = new EventEmitter();
        this.onHidden = new EventEmitter();
    }
    // -------------------------------------------------------------------------
    // Event listeners
    // -------------------------------------------------------------------------
    
    @HostListener('click', ['$event'])
    
    showOrHideOnClick(evt: any) {
        if (this.popoverOnHover) {
            return;
        }
        if (this.popoverDisabled) {
            return;
        }
        evt.stopImmediatePropagation();
        this.toggle();
    }
    
    @HostListener('touchend', ['$event'])
    
    showOrHideOnTouch(evt: any) {
        evt.stopImmediatePropagation();
        if (!this.popoverOnHover) {
            return;
        }
        if (this.popoverDisabled) {
            return;
        }
        this.toggle();
    }
    
    @HostListener('focusin')
    
    @HostListener('mouseenter')
    
    showOnHover() {
        if (!this.popoverOnHover) {
            return;
        }
        if (this.popoverDisabled) {
            return;
        }
        this.show();
    }
    
    @HostListener('focusout')
    
    @HostListener('mouseleave')
    
    hideOnHover() {
        if (this.popoverCloseOnMouseOutside) {
            return; // don't do anything since we do not control this
        }
        if (!this.popoverOnHover) {
            return;
        }
        if (this.popoverDisabled) {
            return;
        }
        this.hide();
    }
    
    ngOnChanges(changes: SimpleChanges) {
        if (changes['popoverDisabled']) {
            if (changes['popoverDisabled'].currentValue) {
                this.hide();
            }
        }
    }
    
    createComponent(component: any): any {
        const componentRef = this.viewContainerRef.createComponent(component);
        if (this.appendToBody) {
            document.body.appendChild((componentRef.hostView as any).rootNodes[0]);
        }
        return componentRef;
    }
    
    removeComponent(componentRef) {
        if (this.popover) {
            if (this.appendToBody) {
                this.appRef.detachView(componentRef.hostView);
            }
            componentRef.destroy();
        }
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    
    toggle() {
        if (!this.visible) {
            this.show();
        }
        else {
            this.hide();
        }
    }
    
    show() {
        if (this.visible) {
            return;
        }
        this.visible = true;
        if (typeof this.content === 'string') {
            if (!this.visible) {
                return;
            }
            this.popover = this.createComponent(this.popoverContentComponent);
            
            const popover = ( (this.popover.instance));
            popover.popover = this;
            popover.content = ( (this.content));
            if (this.popoverPlacement !== undefined) {
                popover.placement = this.popoverPlacement;
            }
            if (this.popoverAnimation !== undefined) {
                popover.animation = this.popoverAnimation;
            }
            if (this.popoverTitle !== undefined) {
                popover.title = this.popoverTitle;
            }
            if (this.popoverCloseOnClickOutside !== undefined) {
                popover.closeOnClickOutside = this.popoverCloseOnClickOutside;
            }
            if (this.popoverCloseOnMouseOutside !== undefined) {
                popover.closeOnMouseOutside = this.popoverCloseOnMouseOutside;
            }
            if (this.popoverSize) {
                popover.size = this.popoverSize;
            }
            popover.appendToBody = this.appendToBody;
            popover.onCloseFromOutside.subscribe((
            () => this.hide()));
            // if dismissTimeout option is set, then this popover will be dismissed in dismissTimeout time
            if (this.popoverDismissTimeout > 0) {
                setTimeout((
                () => this.hide()), this.popoverDismissTimeout);
            }
        }
        else {
            
            const popover = ( (this.content));
            popover.popover = this;
            if (this.popoverPlacement !== undefined) {
                popover.placement = this.popoverPlacement;
            }
            if (this.popoverAnimation !== undefined) {
                popover.animation = this.popoverAnimation;
            }
            if (this.popoverTitle !== undefined) {
                popover.title = this.popoverTitle;
            }
            if (this.popoverCloseOnClickOutside !== undefined) {
                popover.closeOnClickOutside = this.popoverCloseOnClickOutside;
            }
            if (this.popoverCloseOnMouseOutside !== undefined) {
                popover.closeOnMouseOutside = this.popoverCloseOnMouseOutside;
            }
            if (this.popoverSize) {
                popover.size = this.popoverSize;
            }
            popover.appendToBody = this.appendToBody;
            popover.onCloseFromOutside.subscribe((
            () => this.hide()));
            // if dismissTimeout option is set, then this popover will be dismissed in dismissTimeout time
            if (this.popoverDismissTimeout > 0) {
                setTimeout((
                () => this.hide()), this.popoverDismissTimeout);
            }
            popover.show();
        }
        this.cdr.detectChanges();
        this.onShown.emit(this);
    }
    
    hide() {
        if (!this.visible) {
            return;
        }
        this.visible = false;
        this.removeComponent(this.popover);
        if (this.content instanceof PopoverContentComponent) {
            (( (this.content))).hideFromPopover();
        }
        this.cdr.detectChanges();
        this.onHidden.emit(this);
    }
    
    getElement() {
        return this.viewContainerRef.element.nativeElement;
    }
}

@NgModule({
	declarations: [PopoverDirective, PopoverContentComponent],
	imports: [CommonModule],
	exports: [PopoverContentComponent, PopoverDirective],
})
export class PopoverModule { }
