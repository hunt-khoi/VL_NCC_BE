import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { nhomletetEditDialogComponent } from '../nhomletet-edit/nhomletet-edit.dialog.component';
import { nhomletetDataSource } from '../Model/data-sources/nhomletet.datasource';
import { nhomletetModel } from '../Model/nhomletet.model';
import { nhomletetService } from '../Services/nhomletet.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel} from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'm-nhomletet-list',
    templateUrl: './nhomletet-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class nhomletetListComponent implements OnInit {

    // Table fields
    dataSource: nhomletetDataSource;
    displayedColumns = ['STT', 'NhomLeTet', 'MoTa', 'Locked', 'Priority', 'CreatedBy', 'CreatedDate', 'UpdatedBy', 'UpdatedDate', 'actions'];
	@ViewChild(MatPaginator, {static:true}) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
    filterStatus = '';
	filterCondition = '';
    // Selection
    selection = new SelectionModel<nhomletetModel>(true, []);
    productsResult: nhomletetModel[] = [];
    showTruyCapNhanh: boolean = true;
	// filter: any = {};
    _name = "";
    
    gridModel: TableModel;
	gridService: TableService;
	list_button: boolean;
    
	constructor(public nhomletetService1: nhomletetService,
		private danhMucService: CommonService,
        private cookieService: CookieService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private ref: ApplicationRef,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) {
            this._name = this.translate.instant("NHOM_LE_TET.NAME");
    }

    /** LOAD DATA */
	ngOnInit() {
		this.list_button = CommonService.list_button();
        if (this.nhomletetService1 !== undefined) {
			this.nhomletetService1.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'Priority', 0, 10));
		} //mặc định theo priority

        this.gridModel = new TableModel();
		this.gridModel.clear();
		this.gridModel.haveFilter = true;
		this.gridModel.tmpfilterText = Object.assign({}, this.gridModel.filterText);
        this.gridModel.filterText['NhomLeTet'] = "";
        this.gridModel.filterText['MoTa'] = "";

        this.gridModel.disableButtonFilter['Locked'] = true;

        let optionsTinhTrang = [
			{
				name: 'Đã khóa',
				value: 'True', //ko in hoa ko nhận
			},
			{
				name: 'Hoạt động',
				value: 'False',
			}
		];

        this.gridModel.filterGroupDataChecked['Locked'] = optionsTinhTrang.map(x => {
			return {
				name: x.name,
				value: x.value,
				checked: false
			}
        });
        
        this.gridModel.filterGroupDataCheckedFake = Object.assign({}, this.gridModel.filterGroupDataChecked);

        let availableColumns = [
			{

				stt: 1,
				name: 'STT',
				displayName: 'STT',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 2,
				name: 'NhomLeTet',
				displayName: 'Nhóm lễ tết',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 3,
				name: 'MoTa',
				displayName: 'Mô tả',
				alwaysChecked: false,
				isShow: true
			},
			{

				stt: 4,
				name: 'Locked',
				displayName: 'Tình trạng',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 5,
				name: 'Priority',
				displayName: 'Thứ tự',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 6,
				name: 'CreatedBy',
				displayName: 'Người tạo',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 7,
				name: 'CreatedDate',
				displayName: 'Ngày tạo',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 8,
				name: 'UpdatedBy',
				displayName: 'Người sửa',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 9,
				name: 'UpdatedDate',
				displayName: 'Ngày sửa',
				alwaysChecked: false,
				isShow: true
            },
            {

				stt: 10,
				name: 'NgayKhaiBao',
				displayName: 'Ngày khai báo',
				alwaysChecked: false,
				isShow: false
            },
			{
				stt: 99,
				name: 'actions',
				displayName: 'Tác vụ',
				alwaysChecked: true,
				isShow: true
			}
		];
		this.gridModel.availableColumns = availableColumns.sort((a, b) => a.stt - b.stt);
		this.gridModel.selectedColumns = new SelectionModel<any>(true, this.gridModel.availableColumns)


        this.gridService = new TableService(
			this.layoutUtilsService,
			this.ref,
			this.gridModel,
			this.cookieService
		);
        this.gridService.cookieName = 'displayedColumns_nhomletet';

		this.gridService.showColumnsInTable();
        this.gridService.applySelectedColumnsV2(this.cookieService.check('displayedColumns_nhomletet'));

        // If the user changes the sort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page, this.gridService.result)
            .pipe(
                tap(() => {
                    this.loadDataList();
                })
            )
            .subscribe();

        // Init DataSource
        this.dataSource = new nhomletetDataSource(this.nhomletetService1);
        let queryParams = new QueryParamsModel({});

        // Read from URL itemId, for restore previous state
        this.route.queryParams.subscribe(params => {
            queryParams = this.nhomletetService1.lastFilter$.getValue();
            // First load
            this.dataSource.loadList(queryParams);
        });
		this.dataSource.entitySubject.subscribe(res => {
			this.productsResult = res;
			if (this.productsResult != null) {
				if (this.productsResult.length == 0 && this.paginator.pageIndex > 0) {
					this.loadDataList(false);
				}
			}
		});
    }

	loadDataList(holdCurrentPage: boolean = true) {
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            this.sort.direction,
            this.sort.active,
			holdCurrentPage ? this.paginator.pageIndex : this.paginator.pageIndex = 0,
            this.paginator.pageSize,
            this.gridService.model.filterGroupData  //phải có mới filter theo group
        );
        this.dataSource.loadList(queryParams);
    }
    filterConfiguration(): any {

        const filter: any = {};
        if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}

		if (this.filterCondition && this.filterCondition.length > 0) {
            filter.type = +this.filterCondition;
        }

        if (this.gridService.model.filterText) 
            filter.NhomLeTet = this.gridService.model.filterText['NhomLeTet'];
            filter.MoTa = this.gridService.model.filterText['MoTa'];

        return filter; //trả về đúng biến filter
    }

    /** Delete */
    DeleteWorkplace(_item: nhomletetModel) {
		const _title = this.translate.instant('OBJECT.DELETE.TITLE', { name: this._name.toLowerCase() });
		const _description = this.translate.instant('OBJECT.DELETE.DESCRIPTION', { name: this._name.toLowerCase() });
		const _waitDesciption = this.translate.instant('OBJECT.DELETE.WAIT_DESCRIPTION', { name: this._name.toLowerCase() });
		const _deleteMessage = this.translate.instant('OBJECT.DELETE.MESSAGE', { name: this._name });

        const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                return;
            }

            this.nhomletetService1.deleteItem(_item.Id).subscribe(res => {
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

    //Khóa
    BlockWorkplace(_item: nhomletetModel) {
        let _description = '';
        let _waitDesciption = '';
        let _title = '';

        if(_item.Locked == false) { 
            _description = 'Bạn có chắc chắn muốn khóa nhóm lễ tết này không ??';
            _waitDesciption = 'Đang cập nhật ...';
            _title = 'Khóa nhóm lễ tết';
            _item.Locked = true;
        }
        else {
            _description = 'Bạn có chắc chắn muốn mở khóa nhóm lễ tết này không ??';
            _waitDesciption = 'Đang cập nhật ...';
            _title = 'Mở khóa nhóm lễ tết';
            _item.Locked = false;
        }

        const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption); //thay đổi titile là ra confirm khác
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                this.loadDataList(); //để không biến mất ổ khóa
                return;
            }
		    this.nhomletetService1.updateNhomLeTet(_item).subscribe(res => {
                if (res && res.status === 1) {
                    const _messageType = this.translate.instant('OBJECT.EDIT.UPDATE_MESSAGE', { name: this._name });
					this.layoutUtilsService.showInfo(_messageType);
                }
				else {
					this.layoutUtilsService.showError(res.error.message);
                }
                this.loadDataList();
            });
        });

    }

    AddWorkplace() {
        const nhomletetModels = new nhomletetModel();
        nhomletetModels.clear(); // Set all defaults fields
        this.EditNhom(nhomletetModels);
    }

    restoreState(queryParams: QueryParamsModel, id: number) {
        if (id > 0) {
        }

        if (!queryParams.filter) {
            return;
        }
    }

    EditNhom(_item: nhomletetModel, allowEdit: boolean = true) {
        let saveMessageTranslateParam = '';
        //câu thông báo khi thực hiện trong tác vụ
        saveMessageTranslateParam += _item.Id > 0 ?  'OBJECT.EDIT.UPDATE_MESSAGE' : 'OBJECT.EDIT.ADD_MESSAGE';  
        const _saveMessage = this.translate.instant(saveMessageTranslateParam, {name:this._name});
        const dialogRef = this.dialog.open(nhomletetEditDialogComponent, { data: { _item, allowEdit } });
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                this.loadDataList();
            }
			else {
				this.layoutUtilsService.showInfo(_saveMessage);
                this.loadDataList();
            }

        });
    }
    getHeight(): any {
		let obj = window.location.href.split("/").find(x => x == "tabs-references");
		if (obj) {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 354;
			return tmp_height + 'px';
		} else {
			let tmp_height = 0;
			tmp_height = window.innerHeight - 236;
			return tmp_height + 'px';
		}
    }


    //phục vụ CSS
    covertLockButton(lock:boolean): string {
        switch(lock){
            case true: 
                return 'lock_open';
            case false:
                return 'lock'
        }
    }

    covertToolTip(lock:boolean): string {
        switch(lock){
            case true: 
                return 'COMMON.UNBLOCK';
            case false:
                return 'COMMON.BLOCK';
        }
    }

    covertLockToString(lock:boolean): string {
        switch(lock){
            case true: 
                return 'Đã khóa';
            case false:
                return 'Hoạt động';
        }
    }

    covertLockToColor(lock:boolean): string {
		switch (lock) {
            case false:
				return 'kt-badge--success';
			case true:
				return 'kt-badge--metal';
		}
		return '';
	}
}
