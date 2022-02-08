import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import {
  User,
  UserProfileService
} from '../services/user/user-profile.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  onIOsMobileWeb$ = new Subject<boolean>();
  userProfile: Observable<User>;

  constructor(
    private notificationService: NotificationService,
    private userService: UserProfileService,
    private platform: Platform
  ) {
    this.userProfile = this.userService.user$;
    
    this.platform.ready().then(() => {
      this.onIOsMobileWeb$.next(platform.is('mobileweb'));
    })
  }

  ngOnInit() { }

  requestPermissions() {
    this.notificationService.checkPermission();
  }
}
