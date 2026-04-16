import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator, MatSort, MatDialog, MatMenuTrigger, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject } from 'rxjs';
import { ChonVaiTroDataSource } from './chon-vai-tro.datasource';
import { LayoutUtilsService, QueryParamsModel } from 'app/core/_base/crud';
import { CommonService } from '../../services/common.service';
import { FormControl } from '@angular/forms';

@Component({
	selector: 'm-chon-vai-tro',
	templateUrl: './chon-vai-tro.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [DatePipe]
})
export class ChonVaiTroComponent implements OnInit {
	// Table fields
	dataSource: ChonVaiTroDataSource | undefined;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | undefined;
	@ViewChild('sort1', { static: true }) sort: MatSort | undefined;
	@ViewChild('trigger', { static: true }) _trigger: MatMenuTrigger | undefined;

	// Selection
	selection = new SelectionModel<any>(true, []);
	item: any[] = [];
	tmpitem: any[] = [];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	viewLoading: boolean = false;

	previousIndex: number = 0;
	displayedColumns: string[] = ['STT', 'GroupName', 'Ma'/*, 'DonVi'*/];
	Ma: string = '';
	DonVi: number = 0;
	multi: boolean = false;
	disabledDV: boolean = false;
	filterCap = "";
	donvi: FormControl = new FormControl('');
	datatree: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	isZoomSize: boolean = false;
	disabledBtn: boolean = false;

	constructor(
		public dialogRef: MatDialogRef<ChonVaiTroComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private changeDetect: ChangeDetectorRef,
		private layoutUtilsService: LayoutUtilsService,
		private commonService: CommonService) { }

	ngOnInit() {
		this.viewLoading = true;
		if (this.data) {
			if (this.data.DonVi)
				this.DonVi = this.data.DonVi
			if (this.data.filterCap != undefined)
				this.filterCap = this.data.filterCap
			if (this.data.multi != undefined) {
				this.multi = this.data.multi;
				if (this.multi) {
					this.displayedColumns.unshift('select');
				}
			}
		}
		this.donvi = new FormControl(this.DonVi + '', {});
		if (this.data && this.data.disableDV)
			this.disabledDV = this.data.disableDV;
		this.commonService.TreeDonVi().subscribe(res => {
			if (res && res.status == 1) {
				this.datatree.next(res.data);
			}
			else {
				this.datatree.next([]);
				this.layoutUtilsService.showError(res.error.message);
			}
			this.viewLoading = false;
			this.changeDetect.detectChanges();
		})
		if (!this.sort || !this.paginator) return;
		this.sort.sortChange.subscribe(() => { 
			if (this.paginator) 
				this.paginator.pageIndex = 0; 
		});
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.loadVaiTro(true);
				})
			).subscribe();

		// Init DataSource
		this.dataSource = new ChonVaiTroDataSource(this.commonService);
		let queryParams = new QueryParamsModel({});
		this.route.queryParams.subscribe(params => {
			queryParams.filter.filterCap = this.filterCap;
			if (this.filterCap == "5")
				queryParams.filter.filterCapN = this.data.filterCapN;
			if (this.DonVi > 0)
				queryParams.filter.DonVi = this.DonVi
			if (this.data.emptyRow)
				queryParams.filter.emptyRow = this.data.emptyRow
			// First load
			this.dataSource.LoadData(queryParams);
		});
		this.dataSource.entitySubject.subscribe(res => {
			this.item = res;
			//bind selected
			if (this.multi && this.data.selected) {
				for (var i = 0; i < this.data.selected.length; i++) {
					var find = this.item.find(x => x.IdGroup == this.data.selected[i].IdGroup);
					if (find != null)
						this.selection.select(find);
				}
			}
			this.tmpitem = []
			if (this.item != null) {
				if (this.item.length == 0 && this.paginator.pageIndex > 0) {
					this.loadVaiTro(true);
				} else {
					for (let i = 0; i < this.item.length; i++) {
						let tmpElement = this.item[i];
						this.tmpitem.push(tmpElement);
					}
				}
			}
		});
	}

	GetValueNode(item: any) {
		this.DonVi = item.id;
		this.loadVaiTro(true);
	}

	loadVaiTro(holdCurrentPage: boolean = false) {
		if (!this.sort || !this.paginator || !this.dataSource) return;
		const queryParams = new QueryParamsModel(
			this.filterConfiguration(),
			this.sort.direction,
			this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
			this.paginator.pageSize,

		);
		this.dataSource.LoadData(queryParams);
	}

	onSubmit() {
		const re: any[] = [];
		for (let i = 0; i < this.selection.selected.length; i++) {
			re.push(this.selection.selected[i]);
		}
		this.dialogRef.close(re);
	}

	/** FILTRATION */
	filterConfiguration(): any {
		const filter: any = {};
		if (this.DonVi > 0)
			filter.DonVi = this.DonVi;
		if (this.Ma)
			filter.Ma = this.Ma;
		filter.filterCap = this.filterCap
		if (this.filterCap == "5")
			filter.filterCapN = this.data.filterCapN;
		if (this.data.emptyRow)
			filter.emptyRow = this.data.emptyRow
		return filter;
	}
	closeDialog(data: any) {
		this.dialogRef.close(data);
	}
	select(data: any) {
		if (this.multi)
			return;
		this.dialogRef.close(data);
	}
	/** SELECTION */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.item.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		if (this.isAllSelected()) {
			this.selection.clear();
		} else {
			this.item.forEach(row => this.selection.select(row));
		}
	}
}