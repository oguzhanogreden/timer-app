import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Promise<Storage>;

  constructor(private storage: Storage) {
    this._storage = this.storage.create();
  }

  async get(key: string) {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }
    
    return this._storage.then(s => s.get(key));
  }

  set(key: string, value: any) {
    if (!this._storage) {
      return throwError('Storage is undefined');
    }

    this._storage.then(s => s.set(key, value));
  }

  async storedObjects() {
    return await this._storage
    .then(s => s.keys())
    .then(keys => keys.map(async (k: any) => this.get(k)))
    .then(promises => Promise.all(promises))
  }
}
