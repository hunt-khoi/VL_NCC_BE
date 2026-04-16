import { Component, OnInit, ChangeDetectorRef, Inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { merge, BehaviorSubject } from 'rxjs';
//Model
import { FormBuilder, FormGroup } from '@angular/forms';
import { LayoutUtilsService } from '../../../../../../core/_base/crud';
import { CommonService } from '../../../services/common.service';
import { DeXuatService } from '../Services/de-xuat.service';

@Component({
    selector: 'kt-so-quyet-dinh',
    templateUrl: './so-quyet-dinh.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class SoQuyetDinhComponent implements OnInit {
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    viewLoading: boolean = false;
    isZoomSize: boolean = false;
    disabledBtn: boolean = false;
    itemForm: FormGroup;
    item: any = {};

    constructor(
        public dialogRef: MatDialogRef<SoQuyetDinhComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private changeDetect: ChangeDetectorRef,
        private layoutUtilsService: LayoutUtilsService,
        private commonService: CommonService,
        private deXuatService: DeXuatService) { }

    /** LOAD DATA */
    ngOnInit() {
        this.createForm();
        this.deXuatService.detailHuyen(this.data.Id_DotTangQua, this.data.Id_Huyen).subscribe(res => {
            if (res && res.status == 1) {
                this.item = res.data;
                this.createForm();
            }
        })
    }

    createForm() {
        this.itemForm = this.fb.group({
            SoQD: [this.item.SoQD],
            NgayQD: [this.item.NgayQD],
            SoCV: [this.item.SoCV],
            NgayCV: [this.item.NgayCV],
            SoTT: [this.item.SoTT],
            NgayTT: [this.item.NgayTT]
        });

        this.changeDetect.detectChanges();
    }

    getTitle() {
        return 'Cập nhật số quyết định - ' + this.data.Huyen;
    }

    onSubmit(withBack: boolean = false) {
        const controls = this.itemForm.controls;
        let _item: any = {};
        _item.Id = this.item.Id;
        _item.Id_DotTangQua = this.item.Id_DotTangQua;
        _item.Id_Huyen = this.item.Id_Huyen;
        _item.SoQD = controls['SoQD'].value;
        _item.SoCV = controls['SoCV'].value;
        _item.SoTT = controls['SoTT'].value;
        if (controls.NgayQD.value !== '')
            _item.NgayQD = this.commonService.f_convertDate(controls.NgayQD.value);
        if (controls.NgayCV.value !== '')
            _item.NgayCV = this.commonService.f_convertDate(controls.NgayCV.value);
        if (controls.NgayTT.value !== '')
            _item.NgayTT = this.commonService.f_convertDate(controls.NgayTT.value);
        if (this.item.Id == null) {
            this.deXuatService.createHuyen(_item).subscribe(res => {
                this.disabledBtn = false;
                this.changeDetect.detectChanges();
                if (res && res.status === 1) {
                    if (withBack == true) {  //lưu và đóng, withBack = true
                        this.dialogRef.close({
                            _item
                        });
                    }
                    else { //lưu và thêm mới, withBack = false
                        this.ngOnInit(); //khởi tạo lại dialog
                        const _messageType = "Cập nhật số quyết định thành công";
                        this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => {
                        });
                    }
                }
                else {
                    this.layoutUtilsService.showError(res.error.message);
                }
            });
        } else {
            this.deXuatService.updateHuyen(_item).subscribe(res => {
                this.disabledBtn = false;
                this.changeDetect.detectChanges();
                if (res && res.status === 1) {
                    if (withBack == true) {  //lưu và đóng, withBack = true
                        this.dialogRef.close({
                            _item
                        });
                    }
                    else { //lưu và thêm mới, withBack = false
                        this.ngOnInit(); //khởi tạo lại dialog
                        const _messageType = "Cập nhật số quyết định thành công";
                        this.layoutUtilsService.showInfo(_messageType).afterDismissed().subscribe(tt => {
                        });
                    }
                }
                else {
                    this.layoutUtilsService.showError(res.error.message);
                }
            });
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
