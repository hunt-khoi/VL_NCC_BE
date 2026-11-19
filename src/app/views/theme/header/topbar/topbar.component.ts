import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'kt-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class TopbarComponent { }