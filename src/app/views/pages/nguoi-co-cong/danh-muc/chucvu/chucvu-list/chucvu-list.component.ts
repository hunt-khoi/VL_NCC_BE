import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { chucvuModel } from '../Model/chucvu.model';
import { chucvuService } from '../Services/chucvu.service';
import { chucvuDataSource } from '../Model/data-sources/chucvu.datasource';
import { chucvuEditDialogComponent } from '../chucvu-edit/chucvu-edit.dialog.component';

@Component({
    selector: 'm-chucvu-list',
    templateUrl: './chucvu-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class chucvuListComponent implements OnInit {
    // Table fields
    dataSource: chucvuDataSource | undefined;
    displayedColumns = ['STT','Id_row', 'Tenchucdanh', 'Tentienganh', 'NguoiCapNhat', 'NgayCapNhat', 'actions'];
	@ViewChild(MatPaginator, {static:true}) paginator: MatPaginator | undefined;
	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;

	filter: any = {};
	_name = "";
	list_button: boolean = false;
    btnClass: string = "";
    
	constructor(public apiService: chucvuService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService) {
		this._name = this.translate.instant("CHUC_VU.NAME"); 
    }

	ngOnInit() {
		this.list_button = CommonService.list_button();
        this.btnClass = this.list_button ? 'mat-raised-button' : 'mat-icon-button';

        if (this.sort && this.paginator) {
			this.sort.sortChange.subscribe(() => {
				if (this.paginator) this.paginator.pageIndex = 0
			});
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.loadDataList();
					})
				).subscribe();
		}

        // Init DataSource
        this.dataSource = new chucvuDataSource(this.apiService);
        let queryParams = new QueryParamsModel({});
        this.route.queryParams.subscribe(_ => {
			if (this.dataSource) {
				queryParams = this.apiService.lastFilter$.getValue();
				this.dataSource.loadList(queryParams);
			}
		});
    }

	loadDataList(holdCurrentPage: boolean = true) {
        if (!this.paginator || !this.sort || !this.dataSource) return;
        const queryParams = new QueryParamsModel({},
            this.sort.direction,
            this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
            this.paginator.pageSize 
        );
        this.dataSource.loadList(queryParams);
    }

    Delete(_item: chucvuModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });
        const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
        dialogRef.afterClosed().subscribe(res => {
            if (!res) return;
            
            this.apiService.Delete(_item.Id_row).subscribe(res => {
                if (res && res.status === 1) {
					this.layoutUtilsService.showInfo(_deleteMessage);
                }
				else {
					this.layoutUtilsService.showError(res.error.message);
                }
                this.loadDataList();
            });
        });
    }

    Add() {
        const chucvuModels = new chucvuModel();
        chucvuModels.clear(); // Set all defaults fields
        this.Edit(chucvuModels);
    }

    Edit(_item: chucvuModel) {
        let saveMessageTranslateParam = '';
        saveMessageTranslateParam += _item.Id_row > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';
        const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
        const dialogRef = this.dialog.open(chucvuEditDialogComponent, { data: { _item } });
        dialogRef.afterClosed().subscribe(res => {
            this.loadDataList();
			if (res) {
				this.layoutUtilsService.showInfo(_saveMessage);
			}
        });
    }
}