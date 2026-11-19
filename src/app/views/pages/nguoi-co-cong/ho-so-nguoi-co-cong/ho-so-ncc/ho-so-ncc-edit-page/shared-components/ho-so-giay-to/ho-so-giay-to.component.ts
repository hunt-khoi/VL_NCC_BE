import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'kt-ho-so-giay-to',
    templateUrl: './ho-so-giay-to.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HoSoGiayToComponent implements OnInit {
	@Input() parentForm!: FormGroup;
	@Input() GiayTos: any[] = [];
	@Input() isBangTQ: boolean = false;
	@Input() allowEdit: boolean = true;

	constructor() { }

	ngOnInit() {
	}
}
