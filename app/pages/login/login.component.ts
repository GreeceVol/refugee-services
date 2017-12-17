import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import * as email from 'nativescript-email';
import 'rxjs/add/operator/finally';
import * as dialogs from 'ui/dialogs';
import { Page } from 'ui/page';

import { Volunteer } from '../../shared/models/volunteer';
import { AuthService } from '../../shared/services/auth.service';
import { StorageService } from '../../shared/services/storage.service';

@Component({
  selector: 'Login',
  moduleId: module.id,
  templateUrl: './login.component.html',
  styleUrls: ['../../app.css', './login-common.css']
})
export class LoginComponent implements OnInit {

  volunteer: Volunteer;
  isLoading: boolean;

  failCount: number;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private routerExtensions: RouterExtensions,
    private page: Page
  ) {
    this.volunteer = new Volunteer();

    if (this.storageService.getString(StorageService.KEY_TOKEN)) {
      this.navigateToHome();
    }
  }

  ngOnInit(): void {
    this.page.actionBarHidden = true;
    this.failCount = 0;
  }

  login() {
    if (!this.volunteer.isEmailValid()) {
      alert('Enter a valid email address');

      return;
    }

    if (!this.volunteer.isPasswordValid()) {
      alert('Enter a valid password');

      return;
    }

    this.isLoading = true;
    this.authService.login(this.volunteer)
      .finally(() => this.isLoading = false)
      .subscribe(
      () => this.navigateToHome(),
      (err) => {
        if (err.status === 401) {
          dialogs.alert({
            title: 'Login failed',
            message: 'Invalid username or password',
            okButtonText: 'Dismiss'
          });
        } else {
          dialogs.alert({
            title: 'Unknown error',
            message: 'Something went wrong while trying to log in',
            okButtonText: 'Dismiss'
          });
        }
        this.failCount++;
      });
  }

  contactAdmin() {
    email.available()
      .then((isAvailable: boolean) => {
        if (!isAvailable) {
          throw new Error();
        }

        return email.compose({
          subject: 'Issue logging into GreeceVol app',
          body: this.volunteer.email ? `Username (email): ${this.volunteer.email}\n\nTODO: Please elaborate on your login issue here` : `nTODO: Please elaborate on your login issue here`,
          to: ['admin@greecevol.org']
        });
      })
      .catch(() => {
        dialogs.alert({
          title: 'Cannot send email',
          message: 'Unable to create an email draft on your device. Please contact admin@greecevol.org manually',
          okButtonText: 'OK'
        });
      });
  }

  private navigateToHome() {
    this.routerExtensions.navigate(['/home'], { clearHistory: true });
  }

}
