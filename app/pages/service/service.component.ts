import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageRoute, RouterExtensions } from 'nativescript-angular/router';
import { BarcodeScanner } from 'nativescript-barcodescanner';
import * as email from 'nativescript-email';
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-pro-ui/sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/switchMap';
import * as dialogs from 'ui/dialogs';
import { Page } from 'ui/page';

import { Key } from '../../shared/constants/key.constants';
import { Service } from '../../shared/models/service';
import { ServiceFunction } from '../../shared/models/service-function';
import { AuthService } from '../../shared/services/auth.service';
import { ServiceService } from '../../shared/services/service.service';

@Component({
  selector: 'Service',
  moduleId: module.id,
  templateUrl: './service.component.html',
  styleUrls: ['./service-common.css']
})
export class ServiceComponent implements OnInit {

  @ViewChild('drawer') drawerComponent: RadSideDrawerComponent;

  private _service: Service;
  private _serviceID: number;
  private _serviceFunctions: ServiceFunction[];

  private _sideDrawerTransition: DrawerTransitionBase;

  constructor(
    private _authService: AuthService,
    private _serviceService: ServiceService,
    private _routerExtensions: RouterExtensions,
    private _pageRoute: PageRoute,
    private _barcodeScanner: BarcodeScanner
  ) {
    this._pageRoute.activatedRoute
      .switchMap((activatedRoute: ActivatedRoute) => activatedRoute.params)
      .forEach((params) => this._serviceID = Number.parseInt(params[Key.SERVICE_ID_PARAM], 10));
  }

  ngOnInit(): void {
    this._serviceService.getServiceByID(this._serviceID)
      .subscribe((service: Service) => {
        this._service = new Service(service);
        this._serviceFunctions = this._service.getServiceFunctions();
      });
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }

  selectFunction(serviceFunction: ServiceFunction): void {
    this._barcodeScanner.scan({
      formats: 'QR_CODE',
      beepOnScan: true,
      showTorchButton: true,
      preferFrontCamera: false,
      message: `${this._service.serviceName} (${serviceFunction.title} mode)`
    });
  }

  onDrawerButtonTap(): void {
    this.drawerComponent.sideDrawer.showDrawer();
  }

  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition;
  }

  get serviceFunctions(): ServiceFunction[] {
    return this._serviceFunctions;
  }

  get service(): Service {
    return this._service;
  }
}
