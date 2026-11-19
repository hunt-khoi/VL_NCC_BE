import { Component, OnInit, Inject, Input, ViewChild, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BieuMauService } from '../Services/bieu-mau.service';
import { BieuMauQuaService } from '../Services/bieu-mau-qua.service';

@Component({
	selector: 'kt-key-word-list',
	templateUrl: './key-word-list.component.html',
})

export class KeyWordListComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	@Input() IsFull: boolean = true;
	@Input() IsQua: boolean = false;

	keyword: string = '';
	_name = "Danh sách từ khóa";
	displayedColumns: string[] = ['stt', 'keys', 'desciption', 'format', 'default'];
	dataSource: MatTableDataSource<any> | undefined;
	@ViewChild("paginator", { static: true }) paginator: MatPaginator | undefined;

	constructor(public dialogRef: MatDialogRef<KeyWordListComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private danhmuckhacService: BieuMauService,
		private danhmucquaService: BieuMauQuaService) { }

	ngOnInit() {
		const service$ = this.IsQua ? this.danhmucquaService : this.danhmuckhacService;
		service$.getKey(this.keyword).pipe(takeUntil(this.destroy$)).subscribe(res => {
			if (res && res.status == 1) {
				this.dataSource = new MatTableDataSource(res.data);
				if (this.dataSource.paginator) {
					this.dataSource.paginator.firstPage();
				} else if (this.paginator) {
					this.dataSource.paginator = this.paginator;
				}
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	close() {
		this.dialogRef.close();
	}

	filter() {
		this.ngOnInit()
	}
}