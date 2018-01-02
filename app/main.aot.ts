// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { enableProdMode } from '@angular/core';
import { registerElement } from 'nativescript-angular/element-registry';
import { platformNativeScript } from 'nativescript-angular/platform-static';

registerElement('Ripple', () => require('nativescript-ripple').Ripple);
import { AppModuleNgFactory } from './app.module.ngfactory';

enableProdMode();

platformNativeScript().bootstrapModuleFactory(AppModuleNgFactory);
