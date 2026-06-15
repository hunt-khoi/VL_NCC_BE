import { Component, OnInit, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';
import { CauHinhEmailService } from './Services/cau-hinh-email.service';

@Component({
    selector: 'kt-cau-hinh-email',
    templateUrl: './cau-hinh-email.component.html',
})
export class CauHinhEmailComponent implements OnInit {
  constructor(private apiService : CauHinhEmailService) { }

  ngOnInit() {
    if (this.apiService != undefined)
		  this.apiService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'DanhMuc', 0, 10));
  }
}