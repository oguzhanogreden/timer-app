import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import {
  User,
  UserProfileService,
} from '../services/user/user-profile.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit, OnDestroy {
  userProfile: Observable<User>;
  constructor(
    private notificationService: NotificationService,
    private userService: UserProfileService
  ) {
    this.userProfile = this.userService.user$;
  }

  ngOnInit() {}

  requestPermissions() {
    this.notificationService.checkPermission();
  }

  ngOnDestroy(): void {
    this.userProfile;
  }
}
