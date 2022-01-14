import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

type User = {
  onboarded: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private _user = new ReplaySubject<User>();
  user$ = this._user.asObservable();

  constructor() {
    this._user.next({
      onboarded: true,
    });
  }
}
