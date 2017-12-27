import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageRoute } from 'nativescript-angular/router';
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-pro-ui/sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';
import 'rxjs/add/operator/switchMap';

import { Key } from '../../shared/constants/key.constants';
import { Service } from '../../shared/models/service';
import { AuthService } from '../../shared/services/auth.service';
import { ServiceService } from '../../shared/services/service.service';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'Home',
  moduleId: module.id,
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  /* ***********************************************************
  * Use the @ViewChild decorator to get a reference to the drawer component.
  * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
  *************************************************************/
  @ViewChild('drawer') drawerComponent: RadSideDrawerComponent;

  private _services: Service[];
  private _sideDrawerTransition: DrawerTransitionBase;
  private _isLoading: boolean = true;

  constructor(
    private _storageService: StorageService,
    private _authService: AuthService,
    private _serviceService: ServiceService,
    private _pageRoute: PageRoute,
    private _router: Router
  ) {
    this._pageRoute.activatedRoute
      .subscribe(() => {
        if (this._authService.isAuthenticated()) {
          this._getServiceList();
        } else {
          this.onUnauthenticated();
        }
      });
  }

  /* ***********************************************************
  * Use the sideDrawerTransition property to change the open/close animation of the drawer.
  *************************************************************/
  ngOnInit(): void {
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }

  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition;
  }

  get services(): Service[] {
    return this._services;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  onDrawerButtonTap(): void {
    this.drawerComponent.sideDrawer.showDrawer();
  }

  onServiceItemTap(event: { service: Service }): void {
    if (event.service && event.service.ID) {
      this._router.navigate(['/service', event.service.ID]);
    } else {
      alert('Invalid service. Please report an issue');
    }
  }

  onUnauthenticated(): void {
    this._authService.logout();
  }

  private _getServiceList(): void {
    this._isLoading = true;
    this._serviceService.getList()
      .finally(() => {
        this._isLoading = false;
      })
      .subscribe(
      (data: Service[]) => this._updateServices(data),
      (err: any) => this._handleErrors(err)
      );
  }

  private _updateServices(data: Service[]): void {
    this._services = data;
  }

  private _handleErrors(err): void {
    if (err.status === 401) {
      this.onUnauthenticated();
    }
  }
}
