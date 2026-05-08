import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { LoadingComponent } from '../components/loading/loading.component';

export class LoadingOverlayRef {
  constructor(private overlayRef: OverlayRef) { }

  close(): void {
    this.overlayRef.dispose();
  }
}

@Injectable()
export class LoadingService {
  private requestCount = 0;
  private overlayRef: OverlayRef | null = null;
  private dialogRef: LoadingOverlayRef | null = null;

  constructor(private injector: Injector, private overlay: Overlay) { }

  open(): LoadingOverlayRef {
    this.requestCount++;
    if (this.requestCount === 1) {
      const overlayRef = this.createOverlay();
      this.overlayRef = overlayRef;
      this.dialogRef = new LoadingOverlayRef(overlayRef);
      this.attachDialogContainer(overlayRef, this.dialogRef);
    }
    return this.dialogRef!;
  }

  close(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0 && this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
      this.overlayRef = null;
    }
  }

  private createOverlay(): OverlayRef {
    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      positionStrategy
    });
    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer(overlayRef: OverlayRef, dialogRef: LoadingOverlayRef): LoadingComponent {
    const injector = this.createInjector(dialogRef);
    const containerPortal = new ComponentPortal(LoadingComponent, null, injector);
    const containerRef: ComponentRef<LoadingComponent> = overlayRef.attach(containerPortal);
    return containerRef.instance;
  }

  private createInjector(dialogRef: LoadingOverlayRef): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(LoadingOverlayRef, dialogRef);
    return new PortalInjector(this.injector, injectionTokens);
  }
}