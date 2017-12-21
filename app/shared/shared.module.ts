import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptUIListViewModule } from "nativescript-pro-ui/listview/angular";
import { NativeScriptUISideDrawerModule } from 'nativescript-pro-ui/sidedrawer/angular';

import { MyDrawerItemComponent } from './components/my-drawer-item/my-drawer-item.component';
import { MyDrawerComponent } from './components/my-drawer/my-drawer.component';
import { ServiceListComponent } from './components/service-list/service-list.component';

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptUISideDrawerModule,
    NativeScriptUIListViewModule
  ],
  declarations: [
    MyDrawerComponent,
    MyDrawerItemComponent,
    ServiceListComponent
  ],
  exports: [
    MyDrawerComponent,
    ServiceListComponent,
    NativeScriptUISideDrawerModule,
    NativeScriptUIListViewModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class SharedModule { }
