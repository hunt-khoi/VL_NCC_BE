import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';

@Component({
    selector: 'm-tk-tong-hop',
    templateUrl: './tk-tong-hop.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTongHopComponent implements OnInit {
    _name = "";
	lstDot: any[] = [];

    dataThongKe: any[] = [];
    listMQ: any[] = []
    listCacCot: any[] = []
    listTieuDe: any[] = []
    display: boolean = false;
    hideEmptyRows: boolean = false;

    get dataThongKeFiltered(): any[] {
        if (!this.hideEmptyRows) return this.dataThongKe;
        return this.dataThongKe.filter(tk => +tk.TongTien1Xa !== 0);
    }

    viewLoading: boolean = false;
    queryParams: QueryParamsModel = new QueryParamsModel({});
    allowExport = false;
	IdDotTangQua: number = 0;
	loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    
    style_print:any = {
		td : {
			'border-right': '1px solid #dee2e6',
			'border-bottom': '1px solid #dee2e6',
		},
        th : {
            'border-right': '1px solid #dee2e6',
            'border-bottom': '1px solid #dee2e6',    
        },
		table : {'border': '1px solid #dee2e6'}
	};

	constructor(public apiService: tracuuHoSoService,
		private CommonService: CommonService,
        public dialog: MatDialog,
        private changeDetectorRefs: ChangeDetectorRef,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) {
        this._name = this.translate.instant('QUA_TET.tktonghop');
    }

	ngOnInit() {
		this.CommonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
    }

    loadData() {
        if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
        this.queryParams = this.prepareQuery();
        this.viewLoading = true;
        this.tracuu();
    }

    tracuu() {
		this.display = false
		this.loadingSubject.next(true);
		this.apiService.thongKeTongHop(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
            this.viewLoading = false;
            if (res && res.status == 1) {
                this.dataThongKe = res.data
                this.allowExport = true;
                this.getElement();
                this.display = true
            }
            else 
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); 
        })
    }

    onToggleHideEmpty() {
        this.changeDetectorRefs.detectChanges();
    }

    getElement() {
        for (var i=0; i<this.dataThongKe.length; i++) {
            this.listTieuDe = this.dataThongKe[i].TongTien
            return;
        }
    }

	export() {
        if (this.IdDotTangQua <= 0) {
			this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
			return;
		}
		this.loadingSubject.next(true);
		this.apiService.exportTKTongHop(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
			const headers = res.headers;
			const filename = headers.get('x-filename');
			const type = headers.get('content-type');
			const blob = new Blob([res.body], { type });
			const fileURL = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = fileURL;
			link.download = filename;
			link.click();
        }, err => {
			this.layoutUtilsService.showError("Xuất thống kê báo cáo thất bại");
		});
    }

    prepareQuery(): QueryParamsModel { 
        const queryParams = new QueryParamsModel(this.filter(), '', '', 0, 10);
        return queryParams;
    }

    filter(): any {
        const filter: any = {};
		filter.IdDot = this.IdDotTangQua;
        return filter;
    }
}