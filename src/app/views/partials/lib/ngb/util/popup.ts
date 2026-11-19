/*
 * Chep nguyen tu ng-bootstrap 5.3.1 (https://github.com/ng-bootstrap/ng-bootstrap/tree/5.3.1/src),
 * giay phep MIT, xem LICENSE trong thu muc nay. Giu ban nay de HTML va giao dien khong doi
 * (tu ban 12 ng-bootstrap bo ngb-tabset va chuyen sang markup Bootstrap 5).
 */
/* eslint-disable */
import {
  Injector,
  TemplateRef,
  ViewRef,
  ViewContainerRef,
  Renderer2,
  ComponentRef,
  ApplicationRef
} from '@angular/core';

export class ContentRef {
  constructor(public nodes: any[], public viewRef?: ViewRef, public componentRef?: ComponentRef<any>) {}
}

export class PopupService<T> {
  private _windowRef: ComponentRef<T>;
  private _contentRef: ContentRef;

  constructor(
      private _type: any, private _injector: Injector, private _viewContainerRef: ViewContainerRef,
      private _renderer: Renderer2,
      private _applicationRef: ApplicationRef) {}

  open(content?: string | TemplateRef<any>, context?: any): ComponentRef<T> {
    if (!this._windowRef) {
      this._contentRef = this._getContentRef(content, context);
      // Angular 22 bo ComponentFactoryResolver: truyen thang class component.
      this._windowRef = this._viewContainerRef.createComponent<T>(
          this._type, {index: 0, injector: this._injector, projectableNodes: this._contentRef.nodes});
    }

    return this._windowRef;
  }

  close() {
    if (this._windowRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
      this._windowRef = null;

      if (this._contentRef.viewRef) {
        this._applicationRef.detachView(this._contentRef.viewRef);
        this._contentRef.viewRef.destroy();
        this._contentRef = null;
      }
    }
  }

  private _getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = content.createEmbeddedView(context);
      this._applicationRef.attachView(viewRef);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else {
      return new ContentRef([[this._renderer.createText(`${content}`)]]);
    }
  }
}
