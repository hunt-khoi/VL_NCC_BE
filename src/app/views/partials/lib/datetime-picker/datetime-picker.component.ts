import { Component, ViewEncapsulation, forwardRef, Input, Output, EventEmitter, ViewChild, Injectable, OnChanges } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatCalendar } from '@angular/material/datepicker';
import { NgbTimeAdapter, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import moment$1 from 'moment';

const moment = moment$1;

@Injectable()
export class NgbTimeStringAdapter extends NgbTimeAdapter<string> {
    fromModel(value: string): NgbTimeStruct {
        if (!value) {
            return { hour: 0, minute: 0, second: 0 };
        }
        const split = value.split(':');
        return {
            hour: parseInt(split[0], 10),
            minute: parseInt(split[1], 10),
            second: parseInt(split[2], 10)
        };
    }
    toModel(time: NgbTimeStruct): string {
        if (!time) {
            return '00:00';
        }
        return `${this.pad(time.hour)}:${this.pad(time.minute)}`;
    }
    private pad(i: number): string {
        return i < 10 ? `0${i}` : `${i}`;
    }
}

@Component({
    selector: 'm-datetime-picker',
    templateUrl: './datetime-picker.component.html',
    styleUrls: ['./datetime-picker.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter },
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatetimePickerComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DatetimePickerComponent),
            multi: true
        }]
})
export class DatetimePickerComponent implements OnChanges {
    @Input() value: any;
    @Input() disabled: boolean = false;
    @Input() placeholder: string = '';
    @Input() hint: string = '';
    @Input() required: boolean = false;
    @Output() selectionChange = new EventEmitter();
    @ViewChild(MatMenuTrigger, { static: false }) menuTrigger: MatMenuTrigger | undefined;
    @ViewChild(MatCalendar, { static: false }) calendar: MatCalendar<any> | undefined;

    datetimepicker = new FormControl();
    time = '00:00';
    selectedDate: any = undefined;

    onChangeCallback = (value: any) => { };
    onTouchCallback = () => { };

    constructor() { }

    ngOnChanges() {
        const dateRegEx = new RegExp(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
        if (this.required)
            this.datetimepicker = new FormControl(undefined, [Validators.pattern(dateRegEx), Validators.required]);
        else
            this.datetimepicker = new FormControl(undefined, Validators.pattern(dateRegEx));
    }

    registerOnChange(fn: any) {
        if (fn.length)
            this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchCallback = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    validate(control: any) {
        let res = new Promise(resolve => {
            setTimeout(() => {
                return control.invalid;
            }, 10);
        });
        return null;
    }

    writeValue(obj: any) {
        if (obj === null || obj === undefined) {
            this.ClearData(null);
        }
        else {
            var m = moment(obj);
            if (m && m.isValid()) {
                this.datetimepicker.setValue(m.format("DD/MM/YYYY HH:mm"));
                this.time = m.format('HH:mm');
                this.selectedDate = m;
            }
            else {
                this.datetimepicker.setValue(undefined);
                this.time = '00:00';
            }
            this.changetime();
        }
    }

    ClearData(event: any) {
        if (event)
            event.stopPropagation();
    }

    showMenu($event: any) {
        $event.stopPropagation();
        if (!this.disabled) {
            if (this.menuTrigger) {
                this.menuTrigger.openMenu();
            }
            let datePicker = document.getElementById('datepicker');
            if (datePicker)
                datePicker.focus();
        }
    }

    onSelect(data: any) {
        this.selectedDate = data;
        var str = this.selectedDate.format("DD/MM/YYYY") + ' ' + this.time;
        this.datetimepicker.setValue(str);
        this.changetime();
    }

    changetime() {
        if (this.time == null)
            this.time = '00:00';
        if (this.selectedDate) {
            var str = this.selectedDate.format("DD/MM/YYYY") + ' ' + this.time;
            this.datetimepicker.setValue(str);
            this.value = moment(str, "DD/MM/YYYY HH:mm").toDate();
        }
        else
            this.value = undefined;
        this.onChangeCallback(this.value);
        this.selectionChange.emit(this.value);
    }

    onBlur(event: any) {
        if (event.target.value !== '') {
            var m = moment(event.target.value, "DD/MM/YYYY HH:mm");
            if (m != undefined && m.isValid()) {
                this.selectedDate = m;
                if (this.calendar) {
                    this.calendar.activeDate = this.selectedDate;
                }
                this.time = m.format("HH:mm");
                this.changetime();
                return;
            }
        }
        this.selectedDate = undefined;
        this.time = '00:00';
        this.changetime();
    }
}