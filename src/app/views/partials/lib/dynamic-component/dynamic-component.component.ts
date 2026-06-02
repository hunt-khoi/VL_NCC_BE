import { Component, ChangeDetectorRef, ComponentFactoryResolver, Directive, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';

@Directive({
    selector: '[libInsertion]'
})
export class InsertionDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

@Component({
    selector: 'lib-dynamic-component',
    templateUrl: './dynamic-component.component.html',
    styleUrls: ['./dynamic-component.component.scss']
})
export class DynamicComponentComponent {
    @Input() childComponentType: any;
    @Input() data: any;
    @Output() getInstance = new EventEmitter();
    @ViewChild(InsertionDirective, { static: true, read: ViewContainerRef }) insertionPoint: ViewContainerRef;

    componentRef: any;
    instance: any;
    _onClose = new Subject();
    onClose = this._onClose.asObservable();

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private cd: ChangeDetectorRef) { }

    ngOnInit() {
    }

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
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        let viewContainerRef = this.insertionPoint;
        viewContainerRef.clear();
        this.componentRef = viewContainerRef.createComponent(componentFactory);
        this.instance = this.componentRef.instance;
        this.instance.data = this.data;
        this.getInstance.emit(this.instance);
    }
}