import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-pro-ui/sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-pro-ui/sidedrawer/angular';

import { Key } from '../../shared/constants/key.constants';
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

  private _sideDrawerTransition: DrawerTransitionBase;

  constructor(
    private storageService: StorageService,
    private routerExtensions: RouterExtensions
  ) {
    if (!this.storageService.getString(Key.TOKEN)) {
      this.navigateToLogin();
    }
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

  /* ***********************************************************
  * According to guidelines, if you have a drawer on your page, you should always
  * have a button that opens it. Use the showDrawer() function to open the app drawer section.
  *************************************************************/
  onDrawerButtonTap(): void {
    this.drawerComponent.sideDrawer.showDrawer();
  }

  private navigateToLogin() {
    this.routerExtensions.navigate(['/login'], { clearHistory: true });
  }
}
