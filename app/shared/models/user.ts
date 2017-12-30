export class User {

  ID: string;
  email: string;
  name: string;
  gender: string;
  country: string;
  hash: string;

  constructor(obj: any) {
    if (!obj) {
      return;
    }

    if (obj.hasOwnProperty('ID')) {
      this.ID = obj.ID;
    }

    if (obj.hasOwnProperty('name')) {
      this.name = obj.name;
    }

    if (obj.hasOwnProperty('country')) {
      this.country = obj.country;
    }

    if (obj.hasOwnProperty('hash')) {
      this.hash = obj.hash;
    }

    if (obj.hasOwnProperty('gender')) {
      this.gender = obj.gender;
    }
  }
}
