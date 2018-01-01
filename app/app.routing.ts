// import { SettingsComponent } from './pages/settings/settings.component';
// import { HistoryComponent } from './pages/history/history.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ServiceComponent } from './pages/service/service.component';
import { Key } from './shared/constants/key.constants';

export const routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: `service/:${Key.SERVICE_ID_PARAM}`, component: ServiceComponent },
  // { path: 'settings', component: SettingsComponent },
  // { path: 'history', component: HistoryComponent }
];

export const navigableComponents = [
  HomeComponent,
  LoginComponent,
  ServiceComponent
  // SettingsComponent
  // HistoryComponent,
];
