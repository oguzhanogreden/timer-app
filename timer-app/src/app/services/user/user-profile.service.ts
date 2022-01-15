import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

export type User = {
  onboarded: boolean;
};

type UserModifier = (user: User) => User;

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private _user = new ReplaySubject<User>(1);
  user$: Observable<User> = this._user.pipe();

  _completedOnBoarding = new Subject();

  // TODO: There must be a better way.
  _userModel: User = { onboarded: false };

  constructor() {
    this._user.next(this._userModel);
  }

  completeOnBoarding() {
    this._userModel.onboarded = true;
    this._user.next(this._userModel);
  }
}
