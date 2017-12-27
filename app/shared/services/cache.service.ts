import { Injectable } from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { StorageService } from './storage.service';

interface ICacheStorageRecord<T> {
  value: T;
  expiryTime: number;
}

/**
 * Credit: https://gist.github.com/ckimrie/63334b6ad2873bd9db7ccbbf8ccdfd53
 */
@Injectable()
export class CacheService {

  private static MILLIS_IN_A_DAY = 24 * 60 * 60 * 1000;

  constructor(
    private _storageService: StorageService
  ) { }

  observable<T>(key: string, observable: Observable<T>, expiryTimeInMillis: number = CacheService.MILLIS_IN_A_DAY): Observable<T> {
    return Observable.create((observer: Observer<ICacheStorageRecord<T>>) => {
      const storedJSONStr = this._storageService.getString(key);
      if (!storedJSONStr) {
        observer.next(null);
        observer.complete();

        return;
      }
      let cacheRecord: ICacheStorageRecord<T>;
      try {
        cacheRecord = JSON.parse(storedJSONStr);
      } catch (ex) {
        observer.next(null);
        observer.complete();

        return;
      }

      observer.next(cacheRecord);
      observer.complete();
    })
      .map((obj: ICacheStorageRecord<T>) => {
        if (obj) {
          return (obj.expiryTime > Date.now()) ? obj : null;
        }

        return null;
      })
      .flatMap((cacheRecord: ICacheStorageRecord<T> | null) => {
        if (cacheRecord) {
          return Observable.of(cacheRecord.value);
        } else {
          return observable.flatMap((val: any) => this.cache<T>(key, val, expiryTimeInMillis));
        }
      });
  }

  cache<T>(key: string, value: T, expiryTimeInMillis: number = CacheService.MILLIS_IN_A_DAY): Observable<T> {
    const cacheObj: ICacheStorageRecord<T> = {
      expiryTime: Date.now() + expiryTimeInMillis,
      value
    };

    this._storageService.setString(key, JSON.stringify(cacheObj));

    return Observable.of(value);
  }

}
