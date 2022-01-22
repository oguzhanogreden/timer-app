import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, from, of, throwError } from 'rxjs';
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
      switchMap((storage) => from(storage.keys()))
    );
  }

  get(key: string) {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }

    return this._storage.pipe(
      switchMap((s) => from(s.get(key))),
      take(1)
    );
  }

  set(key: string, value: any) {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }

    // this seems to be the cause of typerror
    // from(this._storage.getValue().set(key, value)).pipe(
    //   switchMap((_) => of(null))
    // );
    return of(null);
  }

  storedObjects() {
    return this.storedKeys().pipe(
      switchMap((keys) => keys.map((k) => this.get(k)))
    );
  }
}
