import { Component, OnInit, ChangeDetectorRef, ComponentRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { Moment } from 'moment';
import moment from 'moment';

@Component({
	// eslint-disable-next-line @angular-eslint/component-selector
	selector: 'tr[cancu-lietsi-row-edit]',
	templateUrl: './cancu-lietsi-row-edit.component.html',
})

export class CanCuLSRowEditComponent implements OnInit {
	close$ = new Subject<void>();
	data: any;
	item: any;
	cmpRef: ComponentRef<any> | undefined;
	maxNS: Moment | undefined;
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

	prepare(): any {
		const _item: any = {};
		_item.HoTen = this.HoTen ? this.HoTen.value : "";
		_item.Id_QHGiaDinh = this.Id_QHGiaDinh ? this.Id_QHGiaDinh.value : 0;
		_item.SoBangTQCC = this.SoBangTQCC ? this.SoBangTQCC.value : "";
		_item.SoGCNTB = this.SoGCNTB ? this.SoGCNTB.value : "";
		_item.TLThuongTat = this.TLThuongTat ? this.TLThuongTat.value : "";
		return _item;
	}

	onSubmit() {
		const EditTroCap = this.prepare();
		return EditTroCap;
	}

	close() {
		this.close$.next();
	}

	reset() {
		this.item = Object.assign({}, this.item);
		this.createForm();
	}
}