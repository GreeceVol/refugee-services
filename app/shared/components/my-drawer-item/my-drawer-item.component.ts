import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

/* ***********************************************************
* Keep data that is displayed as drawer items in the MyDrawer component class.
*************************************************************/
@Component({
  selector: 'MyDrawerItem',
  moduleId: module.id,
  templateUrl: './my-drawer-item.component.html',
  styleUrls: ['./my-drawer-item.component.css']
})
export class MyDrawerItemComponent {
  @Input() title: string;
  @Input() route: string;
  @Input() icon: string;
  @Input() isSelected: boolean;
  @Output() onClick = new EventEmitter<void>();

  constructor(private routerExtensions: RouterExtensions) {

  }

  /* ***********************************************************
  * Use the "tap" event handler of the GridLayout component for handling navigation item taps.
  * The "tap" event handler of the app drawer item <GridLayout> is used to navigate the app
  * based on the tapped navigationItem's route.
  *************************************************************/
  onNavItemTap(navItemRoute: string): void {
    if (navItemRoute) {
      this.routerExtensions.navigate([navItemRoute], {
        transition: {
          name: 'fade'
        }
      });
    }

    this.onClick.emit();
  }
}
