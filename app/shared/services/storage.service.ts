import { Injectable } from '@angular/core';
import * as appSettings from 'application-settings';

@Injectable()
export class StorageService {

  static KEY_TOKEN = 'token';

  getString(key: string, defaultValue?: string): string {
    return appSettings.getString(key, defaultValue);
  }

  setString(key: string, value: string): void {
    return appSettings.setString(key, value);
  }

  getNumber(key: string, defaultValue?: number): number {
    return appSettings.getNumber(key, defaultValue);
  }

  setNumber(key: string, value: number): void {
    return appSettings.setNumber(key, value);
  }
}
