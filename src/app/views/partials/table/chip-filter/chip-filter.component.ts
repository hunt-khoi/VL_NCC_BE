import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TableService } from '../table.service';

@Component({
	selector: 'kt-chip-filter',
	templateUrl: './chip-filter.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipFilterComponent {
	@Input() gridService: TableService | undefined;
	constructor() { }
}
