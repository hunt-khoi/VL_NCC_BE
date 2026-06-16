import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';
import { SMSHistoryService } from './Services/sms-history.service';

@Component({
  selector: 'kt-sms-history',
  templateUrl: './sms-history.component.html',
})
export class SMSHistoryComponent implements OnInit {

  constructor(private SMSHistoryService: SMSHistoryService) { }

  ngOnInit() {
    if (this.SMSHistoryService != undefined)
      this.SMSHistoryService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'DanhMuc', 0, 10));
  }
}