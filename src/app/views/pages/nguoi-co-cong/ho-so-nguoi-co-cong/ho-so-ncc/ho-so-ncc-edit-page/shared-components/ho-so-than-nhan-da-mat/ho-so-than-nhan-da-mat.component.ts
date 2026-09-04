import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'kt-ho-so-than-nhan-da-mat',
	templateUrl: './ho-so-than-nhan-da-mat.component.html',
})
export class HoSoThanNhanDaMatComponent implements OnInit {
	@Input() parentForm!: FormGroup;
	@Input() thannhanName2: string = '';
	@Input() quanhe2: any = null;
	@Input() listgioitinh: any[] = [];
	@Input() listquanhevoilietsy: any[] = [];
	
	@Output() thannhanName2Change = new EventEmitter<string>();
	@Output() quanhe2Change = new EventEmitter<any>();
	
	@Output() onChangeQuanHeLietSy2 = new EventEmitter<void>();

	constructor() { }

	ngOnInit() {
	}

	changeQuanHeLietSy2() {
		this.onChangeQuanHeLietSy2.emit();
	}
}
