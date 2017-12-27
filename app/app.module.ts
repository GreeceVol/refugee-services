import { NgModule, NgModuleFactoryLoader, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptFormsModule } from 'nativescript-angular/forms';
import { NativeScriptHttpModule } from 'nativescript-angular/http';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { NativeScriptRouterModule, NSModuleFactoryLoader } from 'nativescript-angular/router';
import { BarcodeScanner } from 'nativescript-barcodescanner';

import { AppComponent } from './app.component';
import { navigableComponents, routes } from './app.routing';
import { AuthService } from './shared/services/auth.service';
import { CacheService } from './shared/services/cache.service';
import { ServiceService } from './shared/services/service.service';
import { StorageService } from './shared/services/storage.service';
import { SharedModule } from './shared/shared.module';

@NgModule({
  bootstrap: [
    AppComponent
  ],
  imports: [
    NativeScriptModule,
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptHttpModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(routes),
    SharedModule
  ],
  declarations: [
    AppComponent,
    ...navigableComponents
  ],
  providers: [
    { provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader },
    StorageService,
    ServiceService,
    AuthService,
    CacheService,
    BarcodeScanner
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule { }
