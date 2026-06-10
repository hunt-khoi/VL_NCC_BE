import { Component, ChangeDetectorRef, Directive, EventEmitter, Input, Output, ViewChild, ViewContainerRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[libInsertion]'
})
export class InsertionDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'lib-dynamic-component',
    templateUrl: './dynamic-component.component.html',
    styleUrls: ['./dynamic-component.component.scss']
})
export class DynamicComponentComponent implements OnDestroy, AfterViewInit {
    @Input() childComponentType: any;
    @Input() data: any;
    @Output() getInstance = new EventEmitter();
    @ViewChild(InsertionDirective, { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef | undefined;

    componentRef: any;
    instance: any;
    _onClose = new Subject();
    onClose = this._onClose.asObservable();

    constructor(private cd: ChangeDetectorRef) { }

    ngAfterViewInit() {
        this.loadChildComponent(this.childComponentType);
        this.cd.detectChanges();
    }

    ngOnDestroy() {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    loadChildComponent(componentType: any) {
        let viewContainerRef = this.insertionPoint;
        if (!viewContainerRef) return;
        viewContainerRef.clear();
        this.componentRef = viewContainerRef.createComponent(componentType);
        this.instance = this.componentRef.instance;
        this.instance.data = this.data;
        this.getInstance.emit(this.instance);
    }
}