import { Component, ChangeDetectionStrategy, ViewEncapsulation, forwardRef, ChangeDetectorRef, Injector, Input, Output, EventEmitter, OnChanges, AfterViewInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { ArrayDataSource } from '@angular/cdk/collections';
import { FormControl, NgControl, Validators, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

@Component({
    selector: 'm-dropdown-tree',
    templateUrl: './dropdown-tree.component.html',
    styleUrls: ['./dropdown-tree.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DropdownTreeComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DropdownTreeComponent),
            multi: true
        }
    ]
})
export class DropdownTreeComponent implements OnChanges, AfterViewInit {
    @Input() data: any;
    @Input() DropdownTitle: string = '';
    @Input() FieldTitle: string = "Title";
    @Input() FieldId: string = "RowID";
    @Input() FieldChildren: string = "Children";
    @Input() disabled: boolean = false;
    @Input() FieldDisable: string = "Disable";
    @Output() SelectedItemTree = new EventEmitter();

    required = false;
    focus = false;
    valid = false;
    treeControl = new NestedTreeControl<any>(node => node[this.FieldChildren]);
    dataSource: any;
    Title = "";
    Placement = "bottom-left";
    selectedNode: any = {};
    dropdowntreeControl = new FormControl();
    hasChild = (_: number, node: any) => !!node[this.FieldChildren] && node[this.FieldChildren].length > 0;

    onChangeCallback = (value: any) => { };
    onTouchCallback = () => { };

    constructor(private changeDetectorRefs: ChangeDetectorRef, private injector: Injector) {
        this.selectedNode[this.FieldTitle] = "";
        this.selectedNode[this.FieldId] = "";
    }

    ngOnChanges() {
        this.dataSource = new ArrayDataSource(this.data);
        if (this.data && this.data.subscribe) {
            this.data.subscribe((data: any) => {
                if (data && data[0] && (data[0][this.FieldId] == undefined || data[0][this.FieldTitle] == undefined)) {
                    this.dataSource = new ArrayDataSource([]);
                }
                this.treeControl.dataNodes = data;
                this.treeControl.expandAll();
            });
        }
    }

    ngAfterViewInit() {
        const ngControl = this.injector.get(NgControl, null);
        if (!ngControl || !ngControl.control) return;

        let _val = ngControl.control.value;
        ngControl.control.setValue('');
        this.dropdowntreeControl = new FormControl();
        if (ngControl.control.errors && ngControl.control.errors.required) {
            this.required = true;
            this.dropdowntreeControl.setValidators(Validators.required);
        }
        if (this.data && this.data.subscribe) {
            this.data.subscribe((data: any) => {
                this.getTitle(data, _val);
                setTimeout(() => {
                    this.dropdowntreeControl.setValue(this.selectedNode[this.FieldTitle]);
                    this.onChangeCallback(this.selectedNode[this.FieldId]);
                    this.ngOnChanges();
                    this.changeDetectorRefs.detectChanges();
                }, 50);
            });
        }
    }

    SelectItemTree(node: any) {
        this.SelectedItemTree.emit(node);
        this.selectedNode = Object.assign({}, node);
        this.dropdowntreeControl.setValue(this.selectedNode[this.FieldTitle]);
        this.onChangeCallback(this.selectedNode[this.FieldId]);
    }

    getTitle(data: any, ID: any) {
        data.forEach((element: any) => {
            if (element[this.FieldId] + '' == ID + '') {
                this.selectedNode[this.FieldTitle] = element[this.FieldTitle];
                this.selectedNode[this.FieldId] = ID;
                return;
            }
            if (element[this.FieldChildren] && element[this.FieldChildren].length) {
                this.getTitle(element[this.FieldChildren], ID);
            }
        });
    }

    focusFunction() {
        if (!this.disabled) {
            this.focus = true;
            this.valid = true;
        }
    }

    focusOutFunction() {
        if (!this.disabled) {
            if (!this.selectedNode[this.FieldId]) {
                this.valid = false;
            }
            this.focus = false;
        }
    }

    ClearData() {
        this.selectedNode[this.FieldTitle] = "";
        this.selectedNode[this.FieldId] = "";
        this.SelectedItemTree.emit(this.selectedNode);
        this.dropdowntreeControl.setValue(this.selectedNode[this.FieldTitle]);
        this.onChangeCallback(this.selectedNode[this.FieldId]);
    }

    writeValue(obj: any) {
        if (obj === null) {
            this.ClearData();
        } else {
            if (obj && this.data && this.data.subscribe) {
                this.data.subscribe((data: any) => {
                    this.selectedNode[this.FieldId] = obj;
                    this.getTitle(data, this.selectedNode[this.FieldId]);
                });
            }
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchCallback = fn;
    }

    validate() {
        this.dropdowntreeControl.markAsTouched();
        this.changeDetectorRefs.detectChanges();
        return null;
    }
}