import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'kt-ho-so-than-nhan',
	templateUrl: './ho-so-than-nhan.component.html'
})
export class HoSoThanNhanComponent implements OnInit {
	@Input() parentForm!: FormGroup;
	@Input() thannhanName: string = '';
	@Input() quanhe: any = null;
	@Input() listgioitinh: any[] = [];
	@Input() listquanhevoilietsy: any[] = [];

	@Output() thannhanNameChange = new EventEmitter<string>();
	@Output() quanheChange = new EventEmitter<any>();
	@Output() onChangeNS1 = new EventEmitter<boolean | void>();
	@Output() onChangeQuanHeLietSy = new EventEmitter<void>();

	constructor() {}

	ngOnInit() {
	}
}
