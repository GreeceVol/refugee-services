// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { registerElement } from 'nativescript-angular/element-registry';
import { platformNativeScriptDynamic } from 'nativescript-angular/platform';

registerElement('Ripple', () => require('nativescript-ripple').Ripple);
import { AppModule } from './app.module';

platformNativeScriptDynamic().bootstrapModule(AppModule);
