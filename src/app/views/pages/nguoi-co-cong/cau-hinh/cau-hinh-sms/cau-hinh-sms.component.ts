import { Component, OnInit, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';
import { CauHinhSMSService } from './Services/cau-hinh-sms.service';

@Component({
    selector: 'kt-cau-hinh-sms',
    templateUrl: './cau-hinh-sms.component.html',
})
export class CauHinhSMSComponent implements OnInit {
  constructor(private apiService : CauHinhSMSService) {}

  ngOnInit() {
    if (this.apiService != undefined)
		this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'DanhMuc', 0, 10));
  }
}