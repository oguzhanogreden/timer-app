import { Component, OnInit } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { from, Observable, Subject } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
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
    private alertController: AlertController,
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
    this.notificationService
      .requestPermission()
      .pipe(
        switchMap(_ => this.notificationService.allowed$),
        take(1),
        filter(allowed => !allowed),
        switchMap(_ => this.presentAlert())
      )
      .subscribe();
  }
  
  private presentAlert(): Observable<void> {
    const alert = this.alertController.create({
      header: "Notifications not allowed",
      message: "This app won't be very useful without notifications. Please go to your device settings and allow notifications.",
      buttons: ["Okay!"]
    })
    
    return from(alert.then(a => a.present()));
  }
}
