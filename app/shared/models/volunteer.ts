import * as EmailValidator from 'email-validator';

export class Volunteer {
  ID: number;
  name: string;
  email: string;
  password: string;
  organisationID: number;

  isEmailValid(): boolean {
    return EmailValidator.validate(this.email);
  }

  isPasswordValid(): boolean {
    // TODO implement password validation
    return !!this.password;
  }
}
