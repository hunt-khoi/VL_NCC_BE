import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'kt-ho-so-giay-to',
	templateUrl: './ho-so-giay-to.component.html'
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
