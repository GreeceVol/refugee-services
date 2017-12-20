import { Component, Input, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';

import { AuthService } from '../../services/auth.service';

/* ***********************************************************
* Keep data that is displayed in your app drawer in the MyDrawer component class.
* Add new data objects that you want to display in the drawer here in the form of properties.
*************************************************************/
@Component({
  selector: 'MyDrawer',
  moduleId: module.id,
  templateUrl: './my-drawer.component.html',
  styleUrls: ['./my-drawer.component.css']
})
export class MyDrawerComponent {
  /* ***********************************************************
  * The "selectedPage" is a component input property.
  * It is used to pass the current page title from the containing page component.
  * You can check how it is used in the "isPageSelected" function below.
  *************************************************************/
  @Input() selectedPage: string;

  constructor(
    private authService: AuthService,
    private routerExtensions: RouterExtensions
  ) { }

  /* ***********************************************************
  * The "isPageSelected" function is bound to every navigation item on the <MyDrawerItem>.
  * It is used to determine whether the item should have the "selected" class.
  * The "selected" class changes the styles of the item, so that you know which page you are on.
  *************************************************************/
  isPageSelected(pageTitle: string): boolean {
    return pageTitle === this.selectedPage;
  }

  logout() {
    this.authService.logout();
    this.routerExtensions.navigate(['/login'], { clearHistory: true });
  }
}
