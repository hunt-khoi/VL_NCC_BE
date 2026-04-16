import { Component, OnInit, ChangeDetectorRef, ComponentRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import moment from 'moment';
import { Moment } from 'moment';
import { Subject } from 'rxjs';
import { CommonService } from '../../services/common.service';

@Component({
	selector: 'tr[cancu-lietsi-row-edit]',
	templateUrl: './cancu-lietsi-row-edit.component.html',
})

export class CanCuLSRowEditComponent implements OnInit {
	close$ = new Subject<void>();
	data: any;
	item: any;
	hasFormErrors = false;
	viewLoading = false;
	loadingAfterSubmit = false;
	disabledBtn = false;
	isZoomSize = false;
	allowEdit = false;

	maxNS: Moment | undefined;
	cmpRef: ComponentRef<any> | undefined;
	showDel: boolean = false;
	//form controls
	HoTen: FormControl | undefined;
	Id_QHGiaDinh: FormControl | undefined
	SoBangTQCC: FormControl | undefined
	SoGCNTB: FormControl | undefined
	TLThuongTat: FormControl | undefined

	listQH: any[] = [];

	constructor(public commonService: CommonService,
		private changeDetectorRefs: ChangeDetectorRef) {
	}

	ngOnInit() {
		this.maxNS = moment(new Date());
		this.item = this.data._item;
		this.listQH = this.data._item.ListQH
		this.createForm();
	}

	createForm() {
		this.HoTen = new FormControl(this.item.HoTen); 
		this.Id_QHGiaDinh = new FormControl(this.item.Id_QHGiaDinh); 
		this.SoBangTQCC = new FormControl(this.item.SoBangTQCC); 
		this.SoGCNTB = new FormControl(this.item.SoGCNTB);
		this.TLThuongTat = new FormControl(this.item.TLThuongTat);
		this.changeDetectorRefs.detectChanges();
	}

	prepareCustomer(): any {
		const _item: any = {};
		_item.HoTen = this.HoTen ? this.HoTen.value : "";
		_item.Id_QHGiaDinh = this.Id_QHGiaDinh ? this.Id_QHGiaDinh.value : 0;
		_item.SoBangTQCC = this.SoBangTQCC ? this.SoBangTQCC.value : "";
		_item.SoGCNTB = this.SoGCNTB ? this.SoGCNTB.value : "";
		_item.TLThuongTat = this.TLThuongTat ? this.TLThuongTat.value : "";
		return _item;
	}

	onSubmit() {
		this.hasFormErrors = false;
		this.loadingAfterSubmit = false;
		const EditTroCap = this.prepareCustomer();
		return EditTroCap;
	}

	close() {
		this.close$.next();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
		this.hasFormErrors = false;
	}
}