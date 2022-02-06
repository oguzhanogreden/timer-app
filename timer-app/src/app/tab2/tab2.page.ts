import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import {
  User,
  UserProfileService
} from '../services/user/user-profile.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  _routeData = this.route.data.pipe(
    map((data) => data as Tab2Data)
  );
  _onboarding = this._routeData.pipe(map((data) => data.onboarding));
  _user: Observable<User>;

  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    public elem: ElementRef,
    private userService: UserProfileService
  ) {
    this._user = this.userService.user$;
    this._onboarding.pipe().subscribe((_) => _);

    this._user
      .pipe(
        filter((u) => !u.onboarded),
        first()
      )
      .subscribe((_) => {
        this.presentOnboardingModal().then((m) => m.present());
      });
  }

  private async presentOnboardingModal() {
    const modal = await this.modalController.create({
      component: OnboardingComponent,
      breakpoints: [0.5, 1],
      initialBreakpoint: 0.5,
    });

    modal.onWillDismiss().then((_) => this.userService.completeOnBoarding());

    return modal;
  }
}

export type Tab2Data = {
  onboarding: boolean;
};
