import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageRoute, RouterExtensions } from 'nativescript-angular/router';
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-pro-ui/sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';
import * as dialogs from 'ui/dialogs';

import { Key } from '../../shared/constants/key.constants';
import { Service } from '../../shared/models/service';
import { ServiceFunction } from '../../shared/models/service-function';
import { ScanError, ScanService } from '../../shared/services/scan.service';
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
    private _pageRoute: PageRoute,
    private _routerExtensions: RouterExtensions,
    private _viewContainerRef: ViewContainerRef,
    private _scanService: ScanService,
    private _serviceService: ServiceService
  ) {
    this._pageRoute.activatedRoute
      .switchMap((activatedRoute: ActivatedRoute) => activatedRoute.params)
      .forEach((params) => this._serviceID = Number.parseInt(params[Key.SERVICE_ID_PARAM], 10));
  }

  ngOnInit(): void {
    this._serviceService.getServiceByID(this._serviceID)
      .subscribe((service: Service) => {
        this._service = service;
        this._serviceFunctions = this._service.getServiceFunctions();
      });
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }

  selectFunction(serviceFunction: ServiceFunction): void {
    try {
      this._scanService.startScan(this._service, serviceFunction, this._viewContainerRef);
    } catch (ex) {
      if (ex) {
        switch (ex.message) {
          case ScanError.INVALID_SERVICE:
            dialogs.alert({
              title: 'Error',
              message: 'Invalid service',
              okButtonText: 'OK'
            }).then(() => {
              this._routerExtensions.backToPreviousPage();
            });
            break;

          case ScanError.INVALID_SERVICE_FUNCTION:
            dialogs.alert({
              title: 'Error',
              message: 'Invalid choice of service function',
              okButtonText: 'OK'
            });
            break;

          case ScanError.INVALID_SERVICE_ACTION:
            dialogs.confirm({
              title: 'Error',
              message: 'Invalid choice of service action',
              okButtonText: 'Try again',
              neutralButtonText: 'Cancel'
            }).then((shouldTryAgain: boolean) => {
              if (shouldTryAgain) {
                this.selectFunction(serviceFunction);
              }
            });
            break;

          default:
            dialogs.alert({
              title: 'Unknown error',
              message: `Unexpected error\n\nAdditional details: \n ${ex.message}`
            });
        }
      }
    }
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
