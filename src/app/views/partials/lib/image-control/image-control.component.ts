import { Component, ViewEncapsulation, forwardRef, ChangeDetectorRef, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';

function readBase64(file: any) {
    var reader = new FileReader();
    var future = new Promise((resolve, reject) => {
        reader.addEventListener("load", function () {
            resolve(reader.result);
        }, false);
        reader.addEventListener("error", function (event) {
            reject(event);
        }, false);
        reader.readAsDataURL(file);
    });
    return future;
}
const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dl-image-control',
    templateUrl: './image-control.component.html',
    styleUrls: ['./image-control.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ImageControlComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => ImageControlComponent),
            multi: true
        }
    ]
})
export class ImageControlComponent implements OnInit {
    @Input() data: any;
    @Input() type: string = "";
    @Input() multiple: boolean = false;
    @Input() required: boolean = false;
    @Input() nameButton: string = "Choose File";
    @Input() disabled: boolean = false;
    @ViewChild('fileUpload', { static: true }) fileUpload: ElementRef | undefined;

    files: any[] = [];
    ImageControl = new FormControl();
    real_files: any[] = [];
    IsValid = false;
    uploader = new FileUploader({ url: URL });
    onChangeCallback = (value: any) => { };
    onTouchCallback = () => { };

    constructor(private changeDetectorRefs: ChangeDetectorRef) { }

    ngOnInit() {
        if (this.data == undefined)
            this.data = {
                Files: [],
                Title: ''
            };
        this.files = [];
        if (this.data.Files && this.data.Files.length > 0) {
            if (this.multiple == false) {
                let file = [];
                file.push(this.data.Files[0]);
                this.files = file;
            }
            else {
                this.files = Object.assign(this.data.Files);
            }
            this.IsValid = true;
        }
        else {
            this.IsValid = false;
        }
        this.real_files = this.files;
    }

    triggerClick() {
        if (this.fileUpload) {
            let ele = this.fileUpload.nativeElement;
            ele.click();
        }
    }

    checkDuplicated(_item: any, file: any) {
        for (var i = 0; i < _item.length; i++) {
            let element = _item[i];
            if (element.filename === file.filename && element.strBase64 === file.strBase64) {
                alert(element.filename + " already exist");
                return false;
            }
        };
        return true;
    }

    onFileSelected(event: any) {
        let _ref = this.changeDetectorRefs;
        let _this = this;
        let _item = this.files;
        try {
            if (this.multiple) {
                for (var i = 0; i < event.length; i++) {
                    const file = event[i];
                    readBase64(file).then(function (data: any) {
                        let _fl = {
                            strBase64: data.split(',')[1],
                            filename: file.name,
                            extension: file.name.split('.').pop(),
                            Type: file.type && file.type.includes('image') ? 1 : 2,
                            type: file.type,
                            IsAdd: true
                        };
                        if (_this.checkDuplicated(_item, _fl)) {
                            _item.push(_fl);
                            _this.IsValid = _this.checkValueControl(_item);
                            _ref.detectChanges();
                            _this.onChangeCallback(_item);
                        }
                    });
                }
            }
            else {
                _item = [];
                if (this.data.Files[0]) {
                    let old_item = Object.assign(this.data.Files[0]);
                    if (old_item) {
                        old_item.IsDel = true;
                        _item.push(old_item);
                    }
                }
                const file = event[0];
                readBase64(file).then(function (data: any) {
                    _item.push({
                        strBase64: data.split(',')[1],
                        filename: file.name,
                        extension: file.name.split('.').pop(),
                        Type: file.type && file.type.includes('image') ? 1 : 2,
                        type: file.type,
                        IsAdd: true
                    });
                    _this.IsValid = _this.checkValueControl(_item);
                    _this.files = _item;
                    _ref.detectChanges();
                    _this.onChangeCallback(_item);
                });
            }
        }
        catch (ex) {
            this.IsValid = false;
        }
    }

    writeValue(obj: any) {
        if (obj === null) {
            this.files = [];
            this.IsValid = this.checkValueControl(this.files);
            this.ImageControl.setValue(this.real_files);
        }
        else {
            if (obj) {
                this.files = obj;
            }
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchCallback = fn;
    }

    checkValueControl(_files: any) {
        let real_arr = [];
        for (var i = 0; i < _files.length; i++) {
            let item = _files[i];
            if (!item.IsDel) {
                real_arr.push(item);
            }
        }
        this.real_files = real_arr;
        if (real_arr.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    DeleteImg(idx: any) {
        if (!this.files[idx].IsAdd) {
            this.files[idx].IsDel = true;
        }
        else {
            this.files.splice(idx, 1);
            this.changeDetectorRefs.detectChanges();
        }
        this.IsValid = this.checkValueControl(this.files);
        this.onChangeCallback(this.files);
    }
}