import { Component, ChangeDetectionStrategy, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TableService } from '../table.service';

@Component({
	selector: 'kt-column-filter',
	templateUrl: './column-filter.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColumnFilterComponent implements OnInit, OnDestroy {
	@Input() enable_sort: boolean = false;
	@Input() column_name: string = "";
	@Input() column_title: string = "";
	@Input() gridService: TableService | undefined;
	private isDestroyed = false;

	constructor(private changeDetect: ChangeDetectorRef) { }

	ngOnInit() {
		if (this.gridService) {
			this.gridService.getOutput().subscribe(_ => {
				if (!this.isDestroyed) {
                    this.changeDetect.detectChanges();
                }
			});
		}
	}

	ngOnDestroy() {
        this.isDestroyed = true; 
    }
}