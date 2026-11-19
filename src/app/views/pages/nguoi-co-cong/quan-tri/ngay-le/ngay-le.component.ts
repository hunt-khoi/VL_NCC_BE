import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'm-ngay-le',
    templateUrl: './ngay-le.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class HolidaysComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}