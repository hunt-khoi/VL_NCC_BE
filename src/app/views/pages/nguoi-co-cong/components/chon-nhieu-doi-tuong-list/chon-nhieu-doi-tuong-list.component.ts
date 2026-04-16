import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryParamsModel, LayoutUtilsService } from 'app/core/_base/crud';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from '../../services/common.service';
import { ChonNhieuDoiTuongListDataSource } from './chon-nhieu-doi-tuong-list.datasource';

@Component({
	selector: 'm-chon-nhieu-doi-tuong-list',
	templateUrl: './chon-nhieu-doi-tuong-list.component.html',
})
export class ChonNhieuDoiTuongListComponent implements OnInit {
	item: any;
	dataSource: ChonNhieuDoiTuongListDataSource | undefined;
	displayedColumns: string[] = [];
	availableColumns = [
		{
			stt: 1,
			name: 'select',
			alwaysChecked: true,
		},
		{
			stt: 2,
			name: 'MaDoiTuong',
			alwaysChecked: false,
		},
		{
			stt: 3,
			name: 'DoiTuong',
			alwaysChecked: false,
		},
		{
			stt: 6,
			name: 'MoTa',
			alwaysChecked: false,
		}
	];
	selectedColumns = new SelectionModel<any>(true, this.availableColumns);
	hasFormErrors: boolean = false;
	viewLoading: boolean = false;
	loadingAfterSubmit: boolean = false;

	// Filter fields
	@ViewChild('searchInput', { static: true }) searchInput: ElementRef | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	selectedValue: any[] = [];

	selection = new SelectionModel<any>(true, []);
	productsResult: any[] = [];

	disabledBtn: boolean = false;
	constructor(public dialogRef: MatDialogRef<ChonNhieuDoiTuongListComponent>,
		private service: CommonService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.item = {};
		this.applySelectedColumns();
		if (!this.sort || !this.paginator) return;
		this.sort.sortChange.subscribe(() => { 
			if (this.paginator) 
				this.paginator.pageIndex = 0; 
		});
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.LoadDataList(true);
				})
			).subscribe();

		if (this.data.selected)
			this.selectedValue = this.data.selected;
		
		// Init DataSource
		this.dataSource = new ChonNhieuDoiTuongListDataSource(this.service, this.layoutUtilsService);
		this.LoadDataList();
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.selectedValue && this.selectedValue.length) {
				this.productsResult.forEach(x => {
					let index = this.selectedValue.findIndex(y => +y.Id == +x.Id);
					if (index >= 0)
						this.selection.select(x);
				});
			}
		});
	}

	/** FILTRATION */
	filterConfiguration(): any {
		if (!this.searchInput) return;
		const filter: any = {};
		const searchText: string = this.searchInput.nativeElement.value;
		filter.keyword = searchText;
		return filter;
	}

	/** ACTIONS */
	LoadDataList(page: boolean = false) {
		if (!this.sort || !this.paginator || !this.dataSource) return;
		this.selection.clear();
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			page ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize
		);
		this.dataSource.loadList(queryParams);
	}

	//chọn cán bộ
	selectItems(_item: any) {
		this.dialogRef.close({ _item });
	}

	close() {
		this.dialogRef.close();
	}

	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.productsResult.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.selected.forEach(row => {
				let i = this.selectedValue.findIndex(x => x.Id == row.Id);
				if (i >= 0)
					this.selectedValue.splice(i, 1);
			})
			this.selection.clear();
		} else {
			this.productsResult.forEach(row => {
				this.selection.select(row);
				let i = this.selectedValue.findIndex(x => x.Id == row.Id);
				if (i < 0)
					this.selectedValue.push(row);
			});
		}
	}

	IsAllColumnsChecked() {
		const numSelected = this.selectedColumns.selected.length;
		const numRows = this.availableColumns.length;
		return numSelected === numRows;
	}

	CheckAllColumns() {
		if (this.IsAllColumnsChecked()) {
			this.availableColumns.forEach(row => { if (!row.alwaysChecked) this.selectedColumns.deselect(row); });
		} else {
			this.availableColumns.forEach(row => this.selectedColumns.select(row));
		}
	}

	applySelectedColumns() {
		const _selectedColumns: string[] = [];
		this.selectedColumns.selected.sort((a, b) => { return a.stt > b.stt ? 1 : 0; }).forEach(col => { _selectedColumns.push(col.name) });
		this.displayedColumns = _selectedColumns;
	}

	goBack(id = 0) {
		if (this.selection.selected.length > 0 && id == 1)
			this.dialogRef.close({ done: true, nhanVienSelected: this.selectedValue });
		else
			this.dialogRef.close({ done: false, nhanVienSelected: [] });
	}

	luuNhanVien() {
		this.goBack(1);
	}

	change($event: any, row: any) {
		$event ? this.selection.toggle(row) : null;
		if (!$event.checked) {
			let i = this.selectedValue.findIndex(x => x.Id == row.Id);
			if (i >= 0)
				this.selectedValue.splice(i, 1);
		} else {
			this.selectedValue.push(row);
		}
	}
}