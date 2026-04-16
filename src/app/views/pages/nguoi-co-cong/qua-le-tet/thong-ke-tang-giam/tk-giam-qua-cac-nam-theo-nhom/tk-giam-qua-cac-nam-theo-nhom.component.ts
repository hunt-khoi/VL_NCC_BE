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
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'

// import { TableModel, TableService } from '../../../partials/table';

@Component({
    selector: 'm-tk-giam-qua-cac-nam-theo-nhom',
    templateUrl: './tk-giam-qua-cac-nam-theo-nhom.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class thongkeGiamQuaNamTheoNhomComponent implements OnInit {
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

    listNhomLeTet: any[]=[];
    
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
    
    labels =  [2020, 2018, 2019]; //trục x
    
    // STATIC DATA FOR THE CHART IN JSON FORMAT.
    chartData = [
        {
          label: 'Nhóm lễ tết A',
          data: [50, 30, 42] 
        }
    ];
    
    // CHART COLOR.
    colors = [
        { 
          backgroundColor: 'rgb(0,255,0,0.3)'
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
        this._name = this.translate.instant("Thống kê giảm qua các năm theo nhóm lễ tết");
    }

    /** LOAD DATA */
    ngOnInit() {
        this.createForm()
        this.loadNhom();
    }

    loadNhom() {
		this.CommonService.liteNhomLeTet().subscribe(res => {
			this.listNhomLeTet = res.data;
			this.changeDetectorRefs.detectChanges();
        });
    }

    loadData() {
        let queryParams = this.prepareQuery();
        this.viewLoading = true;
        this.dottangquaService1.thongKeGiam(queryParams).subscribe(res => {
            this.changeDetectorRefs.detectChanges(); //ko có data sẽ ko xuất hiện
            this.viewLoading = false;
            if(res && res.status == 1) {
                this.dataThongKe = res.data
                
                this.loadChart();
            }
            else 
                this.layoutUtilsService.showError(res.error.message);
        })
    }

    loadChart() {
        this.chartData = []
        var data = []
        for (var val of this.labels) { //danh sách năm cố định đã chọn
            let dem = 0;
            for (var i = 0; i < this.dataThongKe.length; i++) {
                if(this.dataThongKe[i].Nam == val) {
                    data.push(this.dataThongKe[i].SL)
                }
                else
                    dem = dem + 1
                if(dem == this.dataThongKe.length)
                    data.push(0)
            }
        }
        var tennhom = this.changeIdNhomLeTet(this.itemForm.controls.NhomLeTet.value)
        var item = {label: tennhom, data: data }

        this.chartData.push(item);
    }

    changeIdNhomLeTet(id: number): string {
		let input = ""
		this.listNhomLeTet.forEach(i => {
			if (i.id == id)
				input = i.title
		});
		return input;
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

        filter.Id_NhomLeTet = this.itemForm.controls.NhomLeTet.value;
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
            NhomLeTet: [null,Validators.required]
		});
        this.itemForm.controls["NhomLeTet"].markAsTouched();
    }

}
