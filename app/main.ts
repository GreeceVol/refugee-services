// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { enableProdMode } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { platformNativeScriptDynamic } from 'nativescript-angular/platform';

registerElement('Ripple', () => require('nativescript-ripple').Ripple);
import { AppModule } from './app.module';

enableProdMode();

platformNativeScriptDynamic().bootstrapModule(AppModule);
