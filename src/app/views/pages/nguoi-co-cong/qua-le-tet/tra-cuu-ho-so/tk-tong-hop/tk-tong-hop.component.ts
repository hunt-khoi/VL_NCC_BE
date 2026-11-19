import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TokenStorage } from 'app/core/auth/_services/token-storage.service';
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';

@Component({
    selector: 'm-tk-tong-hop',
    templateUrl: './tk-tong-hop.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTongHopComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
    _name: string = "";
    lstDot: any[] = [];

    dataThongKe: any[] = [];
    listMQ: any[] = [];
    listCacCot: any[] = [];
    listTieuDe: any[] = [];
    display: boolean = false;
    hideEmptyRows: boolean = false;

    get dataThongKeFiltered(): any[] {
        if (!this.hideEmptyRows) return this.dataThongKe;
        return this.dataThongKe.filter(tk => +tk.TongTien1Xa !== 0);
    }

    queryParams: QueryParamsModel = new QueryParamsModel({});
    allowExport = false;
    IdDotTangQua: number = 0;
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    Capcocau: number = 0;

    style_print: any = {
        td: {
            'border-right': '1px solid #dee2e6',
            'border-bottom': '1px solid #dee2e6',
        },
        th: {
            'border-right': '1px solid #dee2e6',
            'border-bottom': '1px solid #dee2e6',
        },
        table: { 'border': '1px solid #dee2e6' }
    };

    constructor(public apiService: tracuuHoSoService,
        private CommonService: CommonService,
        public dialog: MatDialog,
        private changeDetectorRefs: ChangeDetectorRef,
        private layoutUtilsService: LayoutUtilsService,
        private tokenStorage: TokenStorage,
        private translate: TranslateService) {
        this._name = this.translate.instant('QUA_TET.tktonghop');
    }

    ngOnInit() {
        this.tokenStorage.getUserInfo().pipe(takeUntil(this.destroy$)).subscribe(res => {
            this.Capcocau = res.Capcocau;
        })
        this.CommonService.liteDotQua(true).pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res && res.status == 1)
                this.lstDot = res.data;
        })
    }

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

    loadData() {
        if (this.IdDotTangQua <= 0) {
            this.layoutUtilsService.showError("Vui lòng chọn đợt tặng quà");
            return;
        }
        this.queryParams = this.prepareQuery();
        this.tracuu();
    }

    tracuu() {
        this.display = false;
        this.loadingSubject.next(true);
        this.apiService.thongKeTongHop(this.queryParams).pipe(takeUntil(this.destroy$)).subscribe(res => {
            this.loadingSubject.next(false);
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
        for (var i = 0; i < this.dataThongKe.length; i++) {
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
        this.apiService.exportTKTongHop(this.queryParams).pipe(takeUntil(this.destroy$)).subscribe(res => {
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