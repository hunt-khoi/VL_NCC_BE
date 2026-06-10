import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'kt-alert',
	templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
	@Input() type: string = 'primary | accent | warn';
	@Input() duration = 0;
	@Input() showCloseButton = true;
	// eslint-disable-next-line @angular-eslint/no-output-native
	@Output() close = new EventEmitter<boolean>();
	alertShowing = true;

	ngOnInit() {
		if (this.duration === 0) return;
		setTimeout(() => {
			this.closeAlert();
		}, this.duration);
	}

	closeAlert() {
		this.close.emit();
	}
}