import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';
import { MatDialogRef, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QueryParamsModel, LayoutUtilsService } from '../../../../../core/_base/crud';
import { SelectionModel } from '@angular/cdk/collections';
import { ChonNhieuBieuMauListModel } from './chon-nhieu-bieu-mau-list.model';
import { ChonNhieuBieuMauListDataSource } from './chon-nhieu-bieu-mau-list.datasource';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'm-chon-nhieu-bieu-mau-list',
	templateUrl: './chon-nhieu-bieu-mau-list.component.html',
})
export class ChonNhieuBieuMauListComponent implements OnInit {
	item: ChonNhieuBieuMauListModel | undefined;
	dataSource: ChonNhieuBieuMauListDataSource | undefined;
	displayedColumns: string[] = [];
	availableColumns = [
		{
			stt: 1,
			name: 'select',
			alwaysChecked: true,
		},
		{
			stt: 2,
			name: 'BieuMau',
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

	selection = new SelectionModel<ChonNhieuBieuMauListModel>(true, []);
	productsResult: ChonNhieuBieuMauListModel[] = [];
	disabledBtn: boolean = false;
	selected: any[] = [];

	constructor(public dialogRef: MatDialogRef<ChonNhieuBieuMauListComponent>,
		private service: CommonService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private layoutUtilsService: LayoutUtilsService) { }

	ngOnInit() {
		this.item = new ChonNhieuBieuMauListModel();
		this.applySelectedColumns();
		if (!this.sort || !this.paginator) return;
		this.sort.sortChange.subscribe(() => { 
			if (this.paginator) 
				this.paginator.pageIndex = 0; 
		});
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.selection.clear();
					this.LoadDataList(true);
				})
			).subscribe();

		if (this.data.selected)
			this.selected = this.data.selected;

		// Init DataSource
		this.dataSource = new ChonNhieuBieuMauListDataSource(this.service, this.layoutUtilsService);
		this.LoadDataList();
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			this.productsResult.forEach(x => {
				if (this.selected.findIndex(nv => nv.Id == x.Id) >= 0)
					this.selection.select(x);
			})
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
		this.dataSource.loadList_Emp(queryParams);
	}

	//chọn 
	selectItems(_item: ChonNhieuBieuMauListModel) {
		this.dialogRef.close({
			_item
		});
	}

	close() {
		this.dialogRef.close();
	}

	selectRow($event: any, row: any) {
		if ($event) {
			this.selection.toggle(row);
			let index = this.selected.findIndex(x => x.Id == row.Id);
			if ($event.checked && index == -1)
				this.selected.push(row);
			if (!$event.checked && index >= 0)
				this.selected.splice(index, 1);
		}
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
			this.selection.clear();
			this.productsResult.forEach(row => {
				let index = this.selected.findIndex(x => x.Id == row.Id);
				if (index >= 0)
					this.selected.splice(index, 1);
			});
		} else {
			this.productsResult.forEach(row => {
				this.selection.select(row);
				let index = this.selected.findIndex(x => x.Id == row.Id);
				if (index == -1)
					this.selected.push(row);
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
			this.dialogRef.close({ done: true, Selected: this.selected });
		else
			this.dialogRef.close({ done: false, Selected: [] });
	}

	luuNhanVien() {
		this.goBack(1);
	}
}