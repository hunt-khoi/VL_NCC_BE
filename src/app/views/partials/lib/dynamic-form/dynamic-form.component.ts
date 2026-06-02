import { Component, OnInit, OnChanges, OnDestroy, EventEmitter, ChangeDetectorRef, Input, Output, ViewChildren, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormService } from './dynamic-form.service';
import { BehaviorSubject } from 'rxjs';
import moment__default from 'moment';

@Component({
    selector: 'kt-dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() set Data(data: any) {
        this._data = data;
    }
    get Data() {
        this._data = this.prepareItem();
        return this._data;
    }
    get FormError() {
        return this.hasFormErrors;
    }

    @ViewChildren('df') dfComponents: any;
    @Input() childComponentType: any;
    @Input() childComponentData: any;
    @Input() FormID: any;
    @Input() ProcessID: any;
    @Input() DataID: any;
    @Input() ActionData: any;
    @Input() GroupBtn: any = false;
    @Input() Conditions: any;
    @Input() InDialog: any = false;
    @Input() UrlBack: any;
    @Output() ComponentTitle = new EventEmitter();
    @Output() ConditionsChange = new EventEmitter();
    @Output() CloseDialog = new EventEmitter();
    @Output() showActionNotification = new EventEmitter();

    _data: any;
    ChildComponentInstance: any;
    item: any;
    itemForm: FormGroup;
    loadingSubject = new BehaviorSubject<boolean>(true);
    hasFormErrors = false;
    SelectedButton: any;
    componentSubscriptions: any;
    headerMargin: any;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private dfService: DynamicFormService,
        private changeDetectorRefs: ChangeDetectorRef,
        private datePipe: DatePipe
    ) { }

    ngOnChanges(changes: SimpleChanges) {
        if (this.FormID && this.FormID > 0) {
            if (changes.Conditions && !changes.Conditions.firstChange) {
                for (var i = 0; i < this.item.controls.length; i++) {
                    let index = i;
                    let ite = this.item.controls[i];
                    if (!ite.IsDepend && ite.APIData && ite.Condition) {
                        let _val = this.Conditions[ite.Condition];
                        if (_val || _val >= 0) {
                            if (this.item.controls[index].DataInit == undefined) {
                                this.dfService.getForeignKeyData(this.genAPI(ite.APIData)).subscribe(res => {
                                    if (res && res.status == 1) {
                                        if (ite.IdControl == 11) {
                                            this.item.controls[index].DataInit = new BehaviorSubject<any>([]);
                                            this.item.controls[index].DataInit.next(res.data);
                                        }
                                        else {
                                            this.item.controls[index].DataInit = res.data;
                                        }
                                        this.changeDetectorRefs.detectChanges();
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    async ngOnInit() {
        if (this.FormID) {
            if (this.ActionData)
                this.item = this.ActionData;
            else {
                let res = await this.dfService.getActionById(this.FormID).toPromise();
                this.item = res.data;
            }
            if (this.item.GroupButton.length > 0)
                this.SelectedButton = this.item.GroupButton[0];
            if (this.Conditions == undefined && this.item.Conditions && this.item.Conditions.length > 0) {
                let temp: any = {};
                for (var i = 0; i < this.item.Conditions.length; i++) {
                    let _name = this.item.Conditions[i];
                    temp[_name] = undefined;
                }
                this.Conditions = temp;
            }
            this.ComponentTitle.emit(this.item.Description);
            if (this.DataID == -1) {
                this.createFormFake();
            }
            else {
                this.createForm();
            }

            for (var i = 0; i < this.item.Buttons.length; i++) {
                if (this.item.Buttons[i].Statement == 'list')
                    this.item.Statement = 'list';
                if (this.item.Buttons[i].IdButtonType == 0 && this.item.Buttons[i].APIData && this.item.Buttons[i].IdColumn) {
                    if (this.item.Buttons[i].Statement != 'list')
                        this.dfService.getValueById(this.item.Buttons[i].APIData, this.item.Buttons[i].IdColumn, this.DataID).subscribe(res => {
                            if (res && res.status == 1) {
                                for (var i = 0; i < this.item.controls.length; i++) {
                                    if (this.item.controls[i].BindData && this.item.controls[i].IdControl >= 0) {
                                        let prop = this.item.controls[i].ColumnName;
                                        let propAs = this.item.controls[i].ColumnNameAs;
                                        if (propAs && res.data[propAs])
                                            this.item.controls[i].value = res.data[propAs];
                                        else if (res.data[prop])
                                            this.item.controls[i].value = res.data[prop];
                                    }
                                }
                                let newConditions = Object.assign({}, this.Conditions);
                                const keys = Object.keys(newConditions);
                                for (var i = 0; i < keys.length; i++) {
                                    let prop = keys[i];
                                    newConditions[prop] = res.data[prop] ? res.data[prop] : 0;
                                }
                                this.Conditions = newConditions;
                                this.ConditionsChange.emit(newConditions);
                            }
                            else {
                                this.showActionNotification.emit({ message: res.error.message, type: 'Error' });
                            }
                            this.createForm();
                        });
                    else
                        this.dfService.getForeignKeyData(this.item.Buttons[i].APIData).subscribe(res => {
                            if (res && res.status == 1) {
                                this.item.list = res.data;
                            }
                            this.changeDetectorRefs.detectChanges();
                        });
                    break;
                }
            }
        }
        else {
            if (this.ProcessID && this.ProcessID > 0) {
                let res = await this.dfService.DFDetailObjectTest(this.ProcessID, this.DataID).toPromise();
                if (res && res.status == 1) {
                    this.ActionData = res.data;
                    this.FormID = res.data.IdRow;
                    this.ngOnInit();
                }
                else {
                    this.showActionNotification.emit({ message: res.error.message, type: 'Error' });
                }
            }
            else {
                const message = `Không tìm thấy chức năng`;
                this.showActionNotification.emit({ message: message, type: 'Warning' });
            }
        }
        window.onload = () => {
            const el = document.getElementById('kt_header');
            if (el) {
                const style = getComputedStyle(el);
                this.headerMargin = parseInt(style.height, 0);
            }
        };
    }

    ngOnDestroy() {
        if (this.componentSubscriptions) {
            this.componentSubscriptions.unsubscribe();
        }
    }

    getConditions(data: any) {
        this.Conditions = data;
        this.changeDetectorRefs.detectChanges();
    }

    createForm() {
        if (!this.item.IsStatic) {
            if (this.item.controls.length > 0) {
                let temp: any = {};
                for (var i = 0; i < this.item.controls.length; i++) {
                    let index = i;
                    let ite = this.item.controls[i];
                    if (ite.IdControl != -2) {
                        if (!ite.IsDepend && ite.APIData) {
                            if ((ite.Condition && this.Conditions && this.Conditions[ite.Condition]) || !ite.Condition) {
                                if (this.item.controls[index].DataInit == undefined) {
                                    this.dfService.getForeignKeyData(this.genAPI(ite.APIData)).subscribe(res => {
                                        if (res && res.status == 1) {
                                            if (ite.IdControl == 11) {
                                                this.item.controls[index].DataInit = new BehaviorSubject<any>([]);
                                                this.item.controls[index].DataInit.next(res.data);
                                            }
                                            else {
                                                this.item.controls[index].DataInit = res.data;
                                            }
                                            this.changeDetectorRefs.detectChanges();
                                        }
                                    });
                                }
                            }
                        }
                        if (ite.IdControl == 10 || ite.IdControl == 13 || ite.IdControl == 12 || ite.IdControl == 14)
                            this.item.controls[index].DataInit = { Files: [], Title: this.item.controls[index].TenHienThi };
                        if (ite.Width > 0) {
                            var _value = ite.value;
                            if (ite.IdControl == 3 && _value) {
                                _value = moment__default(_value, "DD/MM/YYYY HH:mm").toDate();
                            }
                            if (ite.IdControl == 5 && ite.IdDepend) {
                                this.selectionChange(ite, _value);
                            }
                            if (_value && (ite.IdControl == 10 || ite.IdControl == 13))
                                _value = [_value];
                            let validators = [];
                            if (ite.Required)
                                validators.push(Validators.required);
                            if (ite.Pattern)
                                validators.push(Validators.pattern(`${ite.Pattern}`));
                            if (validators.length > 0)
                                if (validators.length > 1)
                                    temp[ite.IdRow] = [_value, Validators.compose(validators)];
                                else
                                    temp[ite.IdRow] = [_value, validators];
                            else
                                temp[ite.IdRow] = [_value];
                        }
                    }
                }
                this.itemForm = this.fb.group(temp);
            }
            this.changeDetectorRefs.detectChanges();
        }
    }

    createFormFake() {
        if (this.item.controls.length > 0) {
            let temp: any = {};
            for (var i = 0; i < this.item.controls.length; i++) {
                let data: any = '';
                let ite = this.item.controls[i];
                if (ite.IdControl != -2) {
                    if (ite.IdControl == 5 || ite.IdControl == 6 || ite.IdControl == 8 || ite.IdControl == 9) {
                        data = this.getDataFake(ite.TenHienThi);
                    }
                    if (ite.IdControl == 11) {
                        let bs = new BehaviorSubject<any>([]);
                        bs.next([{
                            Title: "Tất cả",
                            Children: [
                                {
                                    Title: "Step1",
                                    Children: [
                                        {
                                            Title: "Step11",
                                            Children: [],
                                            RowID: '11'
                                        },
                                        {
                                            Title: "Step12",
                                            Children: [],
                                            RowID: '12'
                                        }
                                    ],
                                    RowID: '1'
                                },
                                {
                                    Title: "Step2",
                                    Children: [],
                                    RowID: '2'
                                }
                            ],
                            RowID: '0'
                        }]);
                        data = bs;
                    }
                    if (ite.IdControl == 10 || ite.IdControl == 12 || ite.IdControl == 13 || ite.IdControl == 14)
                        data = { Files: [], Title: ite.TenHienThi };
                    if (ite.IdControl == 2)
                        data = 0;
                    if (ite.IdControl == 7)
                        data = false;
                    this.item.controls[i].DataInit = data;
                    if (ite.Width > 0) {
                        let validators = [];
                        if (ite.Required)
                            validators.push(Validators.required);
                        if (ite.Pattern)
                            validators.push(Validators.pattern(`${ite.Pattern}`));
                        if (validators.length > 0)
                            if (validators.length > 1)
                                temp[ite.IdRow] = [ite.value, Validators.compose(validators)];
                            else
                                temp[ite.IdRow] = [ite.value, validators];
                        else
                            temp[ite.IdRow] = [ite.value];
                    }
                }
            }
            this.itemForm = this.fb.group(temp);
        }
        this.changeDetectorRefs.detectChanges();
    }

    getDataFake(tenTruong: any) {
        let _list = [];
        for (var i = 0; i < 5; i++) {
            _list.push({
                id: i,
                title: tenTruong + ' thứ ' + i
            });
        }
        return _list;
    }

    async getValue(api: any, column: any, id: any) {
        let res = await this.dfService.getValueById(api, column, id).toPromise();
        return res;
    }

    async getForeignKeyData(api: any) {
        let res = await this.dfService.getForeignKeyData(api).toPromise();
        return res;
    }

    genAPI(api: any) {
        let arr = api.split('?');
        let _api = arr[0];
        if (arr.length > 1) {
            _api += "?";
            let _params = arr[1].split('&');
            for (var i = 0; i < _params.length; i++) {
                if (i > 0)
                    _api += "&";
                var _pairs = _params[i].split('=');
                _api += _pairs[0] + "=" + this.Conditions[_pairs[1]];
            }
        }
        return _api;
    }

    reset() {
        if (this.item.IsStatic) {
            this.ChildComponentInstance.reset();
        }
        else
            this.itemForm.reset();
    }

    goBack(data: any) {
        if (this.InDialog) {
            this.CloseDialog.emit(data);
        }
        else {
            this.loadingSubject.next(false);
            let url = "/";
            if (this.UrlBack)
                url = this.UrlBack;
            this.router.navigateByUrl(url, { relativeTo: this.activatedRoute });
        }
    }

    onSumbit(btn: any, withBack = false, reset = false) {
        let _item: any = {};
        if (this.item.IsStatic)
            _item = this.ChildComponentInstance.onSubmit();
        else
            _item = this.prepareItem();
        if (!_item || this.hasFormErrors) {
            const message = `Vui lòng nhập đầy đủ thông tin`;
            this.showActionNotification.emit({ message: message, type: 'Warning' });
            return;
        }
        _item.IdF = this.FormID;
        _item.IdButton = btn.IdRow;
        _item.Url = btn["Url"];
        _item.Method = btn["Method"];
        _item.DefaultValues = btn.DefaultValues.filter((x: any) => x.IdBtn == btn.IdRow);
        if (!_item.DefaultValues)
            _item.DefaultValues = [];
        _item.IdColumn = btn.IdColumn;
        if (_item.IdColumn)
            _item.DefaultValues.push({
                ColumnName: _item.IdColumn,
                DefaultValue: this.DataID,
                IdControl: -1
            });
        if (btn.DataMap) {
            for (var pro in btn.DataMap) {
                _item.DefaultValues[pro] = btn.DataMap[pro];
            }
        }
        if (this.item.IsStatic) {
            this.dfService.excute(_item).subscribe(res => {
                if (res && res.status == 1) {
                    const message = `Thực thi thành công`;
                    this.showActionNotification.emit({ message: message, type: 'Success' });
                    if (withBack)
                        this.goBack(_item);
                    else if (reset)
                        this.reset();
                }
                else {
                    let message = "Thực thi không thành công";
                    if (res.error)
                        message = res.error.message;
                    this.showActionNotification.emit({ message: message, type: 'Error' });
                }
            });
        }
        else {
            this.dfService.excuteAction(_item).subscribe(res => {
                if (res && res.status == 1) {
                    const message = `Thực thi thành công`;
                    this.showActionNotification.emit({ message: message, type: 'Success' });
                    if (withBack)
                        this.goBack(_item);
                    else if (reset)
                        this.reset();
                }
                else {
                    let message = "Thực thi không thành công";
                    if (res.error)
                        message = res.error.message;
                    this.showActionNotification.emit({ message: message, type: 'Error' });
                }
            });
        }
    }

    onSumbitGroup() {
        this.dfComponents.forEach((child: any) => {
            if (child.Data.IdRow == this.SelectedButton.IdDF) {
                if (child.FormError) {
                    const message = `Vui lòng nhập đầy đủ thông tin`;
                    this.showActionNotification.emit({ message: message, type: 'Warning' });
                    return;
                }
                let _item = Object.assign({}, child.Data);
                _item.IdF = this.SelectedButton.IdDF;
                _item.IdButton = this.SelectedButton.IdRow;
                let btn: any = undefined;
                for (var i = 0; i < _item.Buttons.length; i++) {
                    if (_item.Buttons[i].IdRow == this.SelectedButton.IdRow)
                        btn = _item.Buttons[i];
                }
                _item.Url = btn["Url"];
                _item.Method = btn["Method"];
                _item.IdColumn = btn.IdColumn;
                _item.DefaultValues = btn.DefaultValues;
                if (this.SelectedButton.DataMap) {
                    _item.DefaultValues = _item.DefaultValues.concat(this.SelectedButton.DataMap);
                }
                let withBack = false;
                if (btn.IdButtonType == 4)
                    withBack = true;
                this.dfService.excuteAction(_item).subscribe(res => {
                    if (res && res.status == 1) {
                        const message = `Thực thi thành công`;
                        this.showActionNotification.emit({ message: message, type: 'Success' });
                        if (withBack)
                            this.goBack(_item);
                    }
                    else {
                        let message = "Thực thi không thành công";
                        if (res.error)
                            message = res.error.message;
                        this.showActionNotification.emit({ message: message, type: 'Error' });
                    }
                });
            }
        });
    }

    prepareItem() {
        let _item = Object.assign({}, this.item);
        this.hasFormErrors = false;
        const controls = this.itemForm.controls;
        if (this.itemForm.invalid) {
            Object.keys(controls).forEach(controlName => controls[controlName].markAsTouched());
            this.hasFormErrors = true;
            return _item;
        }
        for (var i = 0; i < _item.controls.length; i++) {
            if (_item.controls[i].IdControl == 0)
                _item.controls[i].value = this.DataID;
            if (_item.controls[i].Width > 0 && _item.controls[i].NewData && _item.controls[i].IdControl >= 1) {
                if (_item.controls[i].IdControl == 10 || _item.controls[i].IdControl == 13) {
                    if (controls[_item.controls[i].IdRow].value && controls[_item.controls[i].IdRow].value.length > 0)
                        _item.controls[i].value = controls[_item.controls[i].IdRow].value[0];
                }
                else if (_item.controls[i].IdControl == 3) {
                    let _date = new Date(controls[_item.controls[i].IdRow].value);
                    _item.controls[i].value = this.datePipe.transform(_date, 'dd-MM-yyyy');
                }
                else {
                    _item.controls[i].value = controls[_item.controls[i].IdRow].value;
                }
            }
            else if (_item.controls[i].IdControl == -2) {
            }
        }
        return _item;
    }

    onAlertClose() {
        this.hasFormErrors = false;
    }

    numberOnly(event: any) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }

    selectionChange(control: any, value: any) {
        if (control.IdDepend) {
            let find = this.item.controls.find((x: any) => x.IdColumn == control.IdDepend);
            this.dfService.getForeignKeyData(find.APIData + value).subscribe(res => {
                if (res && res.status == 1) {
                    find.DataInit = res.data;
                    this.changeDetectorRefs.detectChanges();
                }
            });
        }
    }

    getInstance($event: any) {
        this.ChildComponentInstance = $event;
    }
}