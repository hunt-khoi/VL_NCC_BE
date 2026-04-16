import { Injectable, ApplicationRef, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { LayoutUtilsService } from '../../../core/_base/crud';
import { CdkDragStart, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableModel } from './table.model';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class TableService {
	model: TableModel = new TableModel();
	result: EventEmitter<any> = new EventEmitter<any>();
	cookieName: string = '';

	constructor(private layoutUtilsService: LayoutUtilsService,
		private ref: ApplicationRef,
		private data: TableModel, 
		private cookieService: CookieService) {	
			this.model.copy(data);
		}

	public getOutput(): Observable<any> {
		return this.result;
	}	
	getCookieService() {
		return this.cookieService;
	}

	//#region filter
	SelectAll(event: any, col: any) {
		if (event.checked) {
			this.model.filterGroupDataCheckedFake[col].forEach((element: any) => {
				element.checked = true;
			});
		}
		else {
			this.model.filterGroupDataCheckedFake[col].forEach((element: any) => {
				element.checked = false;
			});
		}
	}

	isColumnSelectAll(col: any) {
		if (this.model.filterGroupDataCheckedFake[col]) {
			let lst_checked = this.model.filterGroupDataCheckedFake[col].filter((opt: any) => opt.checked).map((opt: any) => opt.value);
			if (lst_checked) 
				return lst_checked.length === this.model.filterGroupDataCheckedFake[col].length;
			else 
				return false;
		}
		return false;
	}

	LoadDataDropFilter(col: any) {
		this.model.tmpfilterText = Object.assign({}, this.model.filterText);
		if (this.model.filterGroupDataChecked && this.model.filterGroupDataCheckedFake && this.model.filterGroupDataCheckedFake[col] && this.model.filterGroupDataChecked[col]) {
			this.model.filterGroupDataCheckedFake[col] = this.model.filterGroupDataChecked[col].map((x: any) => Object.assign({}, x));
		}
	}

	disableDoneButton(col: any) {
		let countChecked = 0;
		if (this.model.filterGroupDataCheckedFake && this.model.filterGroupDataCheckedFake[col]) {
			for (var elementFake of this.model.filterGroupDataCheckedFake[col]) {
				if (elementFake.checked) {
					countChecked++;
				}
			}
		}
		if (countChecked > 0) 
			this.model.disableButtonFilter[col] = false;
		else 
			this.model.disableButtonFilter[col] = true;
	}

	showClearAllButton() {
		let count = 0;
		for (var key in this.model.filterGroupArray) {
			if (this.model.filterGroupArray.hasOwnProperty(key)) {
				if (this.model.filterGroupArray[key]) {
					let _arrflt = this.model.filterGroupArray[key].filter((opt: any) => opt.checked);
					count += _arrflt ? _arrflt.length : 0;
				}
			}
		}
		let text = "";
		for (var key in this.model.filterText) {
			if (this.model.filterText.hasOwnProperty(key)) {
				text += this.model.filterText[key];
			}
		}
		if (count > 0 || text) 
			this.model.isClearAll = true;
		else 
			this.model.isClearAll = false;
	}

	filterHead(col: any) {
		if (this.model.filterGroupDataCheckedFake && this.model.filterGroupDataCheckedFake[col]) {
			for (var elementFake of this.model.filterGroupDataCheckedFake[col]) {
				let index = this.model.filterGroupDataChecked[col].findIndex((x: any) => x.value == elementFake.value)
				if (index > -1)
					this.model.filterGroupDataChecked[col][index].checked = elementFake.checked;
			}
			this.model.filterGroupData[col] = [];
			this.model.filterGroupArray[col] = [];
			this.model.filterGroupArray[col] = this.model.filterGroupDataCheckedFake[col]
				.filter((opt: any) => opt.checked);
			this.model.filterGroupData[col] = this.model.filterGroupDataCheckedFake[col]
				.filter((opt: any) => opt.checked).map((op: any) => op.value);

			this.model.filterGroupDataCheckedFake[col] = this.model.filterGroupDataChecked[col].map((x: any) => Object.assign({}, x));
			this.model.tmpfilterText[col] = '';
		}
		this.model.filterText = Object.assign({}, this.model.tmpfilterText);
		if (this.model.filterText) {
			//this.filterConfiguration();
		}
		//this.loadPhieuKiemKeList();
		this.model.isClearAll = this.checkFilterHasValue(this.model.filterGroupDataChecked, 'ALL');
		this.getChip();
	}

	remove(item: any, col: any) {
		let _index = this.model.filterGroupDataChecked[col].findIndex((x: any) => x.value == item.value);
		if (_index > -1) {
			this.model.filterGroupDataChecked[col][_index].checked = false;
			this.model.filterGroupData[col] = [];
			this.model.filterGroupArray[col] = [];
			this.model.filterGroupArray[col] = this.model.filterGroupDataChecked[col]
				.filter((opt: any) => opt.checked);
			this.model.filterGroupData[col] = this.model.filterGroupDataChecked[col]
				.filter((opt: any) => opt.checked).map((op: any) => op.value);

			if (this.model.filterGroupData[col] != null && this.model.filterGroupData[col].length == 0) {
				this.model.filterGroupData[col] = null
				this.model.filterText[col] = '';
				this.model.disableButtonFilter[col] = true;
			}
			this.model.isClearAll = this.checkFilterHasValue(this.model.filterGroupDataChecked, 'ALL');
			this.getChip();
		}
	}

	removeText(col: any) {
		this.model.filterText[col] = "";
		this.model.isClearAll = this.checkFilterHasValue(this.model.filterGroupDataChecked, 'ALL');
		this.getChip();
	}

	Clear() {
		this.model.filterGroupData = [];
		this.model.filterGroupArray = [];
		for (var key in this.model.filterGroupDataChecked) {
			if (this.model.filterGroupDataChecked.hasOwnProperty(key)) {
				if (this.model.filterGroupDataChecked[key]) {
					this.model.filterGroupDataChecked[key].forEach((element: any) => {
						element.checked = false;
					});
					this.model.disableButtonFilter[key] = true;
				}
			}
		}
		for (var key in this.model.filterText) {
			if (this.model.filterText.hasOwnProperty(key)) {
				this.model.filterText[key] = "";
			}
		}
		this.model.isClearAll = false;
		this.getChip();
	}

	checkFilterHasValue(data: any, col: any) {
		let count = 0;
		if (col == 'ALL' && data) {//check all column
			for (var key in data) {
				if (data.hasOwnProperty(key)) {
					if (data[key]) {
						let _arrflt = data[key].filter((opt: any) => opt.checked);
						count += _arrflt ? _arrflt.length : 0;
					}
				}
			}
			let text = "";
			for (var key in this.model.filterText) {
				if (this.model.filterText.hasOwnProperty(key)) {
					text += this.model.filterText[key];
				}
			}
			if (count > 0 || text) {
				return true;
			}
		}
		else { // check in 1 column
			if (data && data[col]) {
				let _arrflt = data[col].filter((opt: any) => opt.checked);
				count += _arrflt ? _arrflt.length : 0;
			}
			if (count > 0) {
				return true;
			}
		}
		return false;
	}

	filterGroupWithTextFilter(columnName: string) {
		let search = this.model.tmpfilterText[columnName]
		if (!search) {
			this.model.filterGroupDataCheckedFake[columnName] = this.model.filterGroupDataChecked[columnName]
			.map((x: any) => Object.assign({}, x));
			return;
		} else {
			search = search.toLowerCase();
		}
		this.model.filterGroupDataCheckedFake[columnName] = this.model.filterGroupDataChecked[columnName]
		.filter((ts: { name: string; }) => ts.name.toLowerCase().indexOf(search) > -1)
		//this.changeDetect.detectChanges();
	}

	getChip() {
		let list = [];
		for (var key in this.model.filterGroupArray) {
			if (this.model.filterGroupArray[key].length > 0) {
				let col = this.model.availableColumns.find(x => x.name == key);
				let item = {
					type: 1,
					key: key,
					title: col.displayName,
					data: this.model.filterGroupArray[key]
				}
				list.push(item);
			}
		}
		for (var key in this.model.filterText) {
			if (this.model.filterText[key]) {
				let col = this.model.availableColumns.find(x => x.name == key);
				let item = {
					type: 2,
					key: key,
					title: col.displayName,
					data: this.model.filterText[key]
				}
				list.push(item);
			}
		}
		this.model.lstChip = list;
		this.result.emit(this.model.filterGroupData);
		this.ref.tick();
	}
	//#endregion

	//#region drag drop
	dragStarted(event: CdkDragStart, column: string) {
		this.model.previousIndex = this.findIndexColumn(column);
	}

	dropListDropped(event: CdkDropList, column: string) {
		if (event) {
			moveItemInArray(this.model.availableColumns, this.model.previousIndex, this.findIndexColumn(column));
			this.applySelectedColumns();
		}
	}

	applySelectedColumns() {
		//this.model.availableColumns = this.model.availableColumns.sort((a, b) => a.stt - b.stt);
		let _selectedColumns = this.model.selectedColumns.selected;
		this.model.selectedColumns = new SelectionModel<any>(true, this.model.availableColumns);
		for (let i = 0; i < this.model.availableColumns.length; i++) {
			this.model.selectedColumns.toggle(this.model.availableColumns[i]);
			for (let j = 0; j < _selectedColumns.length; j++) {
				if (this.model.availableColumns[i].name == _selectedColumns[j].name) {
					this.model.selectedColumns.toggle(this.model.availableColumns[i]);
					break;
				}
			}
		}
		const _applySelectedColumns: string[] = [];
		this.model.selectedColumns.selected.forEach(col => { _applySelectedColumns.push(col.name) });
		this.model.displayedColumns = _applySelectedColumns;
	}

	applySelectedColumnsV2(cookie: boolean = false) {
		if (!cookie && this.cookieService != null) {
			let _selectedColumns = this.model.selectedColumns.selected;
			this.model.selectedColumns = new SelectionModel<any>(true, this.model.availableColumns);
			for (let i = 0; i < this.model.availableColumns.length; i++) {
				this.model.selectedColumns.toggle(this.model.availableColumns[i]);
				for (let j = 0; j < _selectedColumns.length; j++) {
					if (this.model.availableColumns[i].name == _selectedColumns[j].name) {
						this.model.selectedColumns.toggle(this.model.availableColumns[i]);
						break;
					}
				}
			}
			const _applySelectedColumns: string[] = [];
			this.model.selectedColumns.selected.forEach(col => { _applySelectedColumns.push(col.name) });
			this.model.displayedColumns = _applySelectedColumns;
		}
		else {
			let tmp = JSON.parse(this.cookieService.get(this.cookieName));
			this.model.selectedColumns = new SelectionModel<any>(true, this.model.availableColumns);
			for (let i = 0; i < this.model.availableColumns.length; i++) {
				this.model.selectedColumns.toggle(this.model.availableColumns[i]);
				for (let j = 0; j < tmp.length; j++) {
					if (this.model.availableColumns[i].name == tmp[j]) {
						this.model.selectedColumns.toggle(this.model.availableColumns[i]);
						break;
					}
				}
			}
			this.model.displayedColumns = tmp;
			this.cookieService.delete(this.cookieName);
		}
		this.cookieService.set(this.cookieName, JSON.stringify(this.model.displayedColumns));
	}

	//Apply selected Column
	IsAllColumnsChecked() {
		const numSelected = this.model.selectedColumns.selected.length;
		const numRows = this.model.availableColumns.length;
		return numSelected === numRows;
	}

	CheckAllColumns() {
		if (this.IsAllColumnsChecked()) {
			this.model.availableColumns.forEach(row => { if (!row.alwaysChecked) this.model.selectedColumns.deselect(row); });
		} else {
			this.model.availableColumns.forEach(row => this.model.selectedColumns.select(row));
		}
	}

	showColumnsInTable() {
		for (let i = 0; i < this.model.availableColumns.length; i++) {
			if (this.model.availableColumns[i].isShow == false) {
				this.model.selectedColumns.toggle(this.model.availableColumns[i]);
			}
		}
	}

	findIndexColumn(column: string): number {
		for (let i = 0; i < this.model.availableColumns.length; i++) {
			if (this.model.availableColumns[i].name == column)
				return i;
		}
		return -1;
	}

	menuChange(e: any, type: 0 | 1 = 0) {
		this.layoutUtilsService.menuSelectColumns_On_Off();
	}
	//#endregion
}
