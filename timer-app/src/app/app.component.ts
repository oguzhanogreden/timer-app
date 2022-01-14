import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppRoutePath } from './app-routing.module';
import { NotificationService } from './services/notification.service';
import { UserProfileService } from './services/user/user-profile.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private notification: NotificationService,
    private userService: UserProfileService,
    private router: Router
  ) {}

  onboardingNeeded = this.userService.user$.pipe(
    map((user) => !user.onboarded)
  );

  ngOnInit(): void {
    this.onboardingNeeded
      .pipe(filter((x) => !x))
      .subscribe((_) => this.navigateToSettings());
  }

  private navigateToSettings() {
    const route: AppRoutePath = 'onboarding';
    this.router.navigate([route]);
  }
}
