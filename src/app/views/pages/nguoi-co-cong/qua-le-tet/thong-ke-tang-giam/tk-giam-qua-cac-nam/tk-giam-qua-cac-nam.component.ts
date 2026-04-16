import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ApplicationRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
// Material
import { MatPaginator, MatSort, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
// RXJS
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services

import { dottangquaService } from '../../dot-tang-qua/Services/dot-tang-qua.service';

import { CommonService } from '../../../services/common.service';
import { LayoutUtilsService, QueryParamsModel } from '../../../../../../core/_base/crud';
import { TableModel} from '../../../../../partials/table';
import { TableService } from '../../../../../partials/table/table.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'

@Component({
    selector: 'm-tk-giam-qua-cac-nam',
    templateUrl: './tk-giam-qua-cac-nam.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeGiamQuaNamComponent implements OnInit {
    // Table fields
    displayedColumns = ['STT', 'HoTen', 'SoHoSo'];
	@ViewChild(MatPaginator, {static:true}) paginator: MatPaginator;
	@ViewChild('sort1', { static: true }) sort: MatSort;
    //@ViewChild('searchInput') searchInput: ElementRef;

    filterStatus = '';
	filterCondition = '';
    _name = "";

    itemForm: FormGroup;

    dataThongKe: any[]=[];
    list10year: any[]=[];
    
    gridModel: TableModel;
    gridService: TableService;


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
    labels =  ['2020', '2019']; //trục x
    
    // STATIC DATA FOR THE CHART IN JSON FORMAT.
    chartData = [
        {
          label: 'Nhóm lễ tết 1',
          data: [98, 32] 
        },
        { 
          label: 'Nhóm lễ tết 2',
          data: [65, 47]
        }
    ];
    
    // CHART COLOR.
    colors = [
        { 
          backgroundColor: 'rgba(77,83,96,0.2)'
        },
        { 
          backgroundColor: 'rgba(30, 169, 224, 0.8)'
        }
    ]

    viewLoading: boolean = false;
    loadingAfterSubmit:boolean=false;

	constructor(public dottangquaService1: dottangquaService,
		private CommonService: CommonService,
        public dialog: MatDialog,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private ref: ApplicationRef,
        private changeDetectorRefs: ChangeDetectorRef,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) 
    {
        this._name = this.translate.instant("Thống kê giảm qua các năm");
    }

    /** LOAD DATA */
    ngOnInit() {
        this.createForm()
    }

    loadData() {
        let queryParams = this.prepareQuery();
        this.viewLoading = true;
        this.dottangquaService1.thongKeGiam(queryParams).subscribe(res => {
            this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
            this.viewLoading = false;
            if(res && res.status == 1) {
                this.dataThongKe = res.data
                
                this.loadChart(); //load biểu đồ
            }
            else 
                this.layoutUtilsService.showError(res.error.message);
        })
    }

    loadChart() {
        this.chartData = []
        for (var i = 0; i < this.dataThongKe.length; i++) {
            var data = []
            for (var val of this.labels) { //danh sách năm cố định đã chọn
                let dem = 0;
                for (var j = 0; j < this.dataThongKe[i].ThongKe.length; j++) {
                    if(this.dataThongKe[i].ThongKe[j].Nam == val) {
                        data.push(this.dataThongKe[i].ThongKe[j].SL)
                    }
                    else
                        dem = dem + 1
                    if(dem == this.dataThongKe[i].ThongKe.length)
                        data.push(0)
                }
            }
            var item = {label: this.dataThongKe[i].NhomLeTet, data: data }

            this.chartData.push(item);
		}
    }

    prepareQuery(): QueryParamsModel { 
        let valGroup = this.itemForm.controls.Nam.value
        const queryParams = new QueryParamsModel(
            this.filterConfiguration(),
            '', '', 0, 10,
            this.filterGroup(valGroup)
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
        return filter;
    }

	createForm() {
		var now = moment();
		let y = now.year();
		var i;
		for (i = 10, i >= 0; i--;) {
			let nn = y - i;
			let n: any = { id: nn, title: 'Năm ' + nn };
			this.list10year.push(n);
		}
		this.itemForm = this.fb.group({
			Nam: [Validators.required],
		});
		this.itemForm.controls["Nam"].markAsTouched();
    }
}
