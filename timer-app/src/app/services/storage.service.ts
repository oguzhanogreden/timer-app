import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage = new BehaviorSubject<Storage>(null);

  constructor(private storage: Storage) {
    this.storage.create().then((s) => this._storage.next(s));
  }

  private storedKeys() {
    return this._storage.pipe(
      filter((storage) => storage !== null),
      take(1), // Storage observables should be like http, they should complete.
      switchMap((storage) => from(storage.keys()))
    );
  }

  get(key: string): Observable<any> {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }

    return this._storage.pipe(
      switchMap((s) => from(s.get(key))),
      take(1)
    );
  }

  set(key: string, value: any): Observable<any> {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }

    return this._storage.pipe(
      take(1),
      switchMap((s) => s.set(key, value))
    );
  }

  storedObjects() {
    return this.storedKeys().pipe(
      switchMap((keys) => keys.map((k) => this.get(k)))
    );
  }
}
