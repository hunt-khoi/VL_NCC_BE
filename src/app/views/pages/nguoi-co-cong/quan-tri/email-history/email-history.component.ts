import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueryParamsModel } from 'app/core/_base/crud';
import { EmailHistoryService } from './Services/email-history.service';

@Component({
  selector: 'kt-email-history',
  templateUrl: './email-history.component.html',
})
export class EmailHistoryComponent implements OnInit {

  constructor(private EmailHistoryService: EmailHistoryService) { }

  ngOnInit() {
    if (this.EmailHistoryService != undefined)
      this.EmailHistoryService.lastFilter$ = new BehaviorSubject(new QueryParamsModel({}, 'asc', 'DanhMuc', 0, 10));
  }
}