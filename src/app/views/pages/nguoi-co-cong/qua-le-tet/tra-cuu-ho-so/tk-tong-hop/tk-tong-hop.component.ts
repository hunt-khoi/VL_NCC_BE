import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { tracuuHoSoService } from '../../tra-cuu-ho-so/Services/tra-cuu-ho-so.service';
import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';

@Component({
    selector: 'm-tk-tong-hop',
    templateUrl: './tk-tong-hop.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongKeTongHopComponent implements OnInit {
	@ViewChild(MatPaginator, {static:true}) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;

    filterStatus = '';
	filterCondition = '';
    _name = "";

	lstDot: any[] = [];

    dataThongKe: any[] = [];
    list10year: any[] = [];
    listYearChoose: any[] = []

    listMQ: any[] = []
    listCacCot: any[] = []
    listTieuDe: any[] = []
    tongHuyen: any[] = []
    tongXa: any[] = []
    display: boolean = false;

    chartOptions = {
        responsive: true ,   // THIS WILL MAKE THE CHART RESPONSIVE (VISIBLE IN ANY DEVICE).
        plugins: {
            labels: {
                //render 'label', 'value', 'percentage', 'image' or custom function, default is 'percentage'
                render: function () { return ''; },
            }
        }  
    }

    //dữ liệu chart data mẫu  
    labels =  ['', '']; //trục x
    
    // STATIC DATA FOR THE CHART IN JSON FORMAT.
    chartData = [
        {
            label: '',
            data: [0, 0] 
        },
        { 
            label: '',
            data: [0, 0]
        }
    ];
    
    // CHART COLOR.
    colors = [
        { 
            backgroundColor: 'rgba(0,0,0,0)'
        },
        { 
            backgroundColor: 'rgba(0,0,0,0)'
        }
    ]

    //4 màu cho tối đa 4 nhóm
    bgColor = ['rgba(30,169,224,0.8)', 'rgba(77,83,96,0.2)', 'rgba(255,228,181,0.4)', 'rgba(100,149,237,0.5)']

    viewLoading: boolean = false;
    queryParams: QueryParamsModel;
    allowExport = false;
	IdDotTangQua: number=0;
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

	constructor(public tracuuHoSoService: tracuuHoSoService,
		private CommonService: CommonService,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private ref: ApplicationRef,
        private changeDetectorRefs: ChangeDetectorRef,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) {
        this._name = this.translate.instant('QUA_TET.tktonghop');
    }

    /** LOAD DATA */
	ngOnInit() {
		this.CommonService.liteDotQua(true).subscribe(res => {
			if (res && res.status == 1)
				this.lstDot = res.data;
		})
    }

    loadData() {
        this.queryParams = this.prepareQuery();
        this.viewLoading = true;
        this.thongKeTongHop()
    }

    thongKeTongHop() {
		this.display = false
		this.loadingSubject.next(true);
		this.tracuuHoSoService.thongKeTongHop(this.queryParams).subscribe(res => {
			this.loadingSubject.next(false);
            this.viewLoading = false;
            if(res && res.status == 1) {
                this.dataThongKe = res.data
                this.allowExport = true;
                //this.getTienTungMQ()
                this.getElement()
                this.display = true
            }
            else 
				this.layoutUtilsService.showError(res.error.message);
			this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
        })
    }

    getElement() {
        for (var i=0; i<this.dataThongKe.length; i++) {
            this.listTieuDe = this.dataThongKe[i].TongTien
            return;
        }
    }

	xuatDanhSach() {
		this.loadingSubject.next(true);
		this.tracuuHoSoService.exportTKTongHop(this.queryParams).subscribe(res => {
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
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            '', '', 0, 10,
        );
        return queryParams;
    }

    filterGroup(values: any[]): any {
        let filterGroup: any = [];
        let val = []
        for (let item of values) {
            val.push(item)
        }
        filterGroup.Nam = val

        this.labels = val; //label cho trục x (Năm)
        return filterGroup; 
    }

    filterConfiguration(): any {
        const filter: any = {};
        if (this.filterStatus && this.filterStatus.length > 0) {
			filter.status = +this.filterStatus;
		}
		if (this.filterCondition && this.filterCondition.length > 0) {
            filter.type = +this.filterCondition;
        }

		filter.IdDot = this.IdDotTangQua
        return filter;
    }

    //bắt sự kiện check
    onCheckboxChange(e) {
        if (e.checked) {
            this.listYearChoose.push(e.source.value);
        } 
        else {
            let index = this.listYearChoose.indexOf(e.source.value, 0);
            if (index > -1) {
                this.listYearChoose.splice(index, 1);
            }
        }
        this.listYearChoose.sort();
    }

    get10YearLast(){
        var n: number = 10;
        let now = new Date();
        var year = now.getFullYear();
        while(n > 0) { 
            this.list10year.push(year);
            year = year -1;
            n = n - 1;
        }
    }
}
