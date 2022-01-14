import { Component, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { map, tap } from 'rxjs/operators';
import { OnboardingComponent } from '../onboarding/onboarding.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
})
export class Tab2Page {
  _routeData = this.route.data.pipe(
    map((data) => data as Tab2Data),
    tap((x) => console.log(x))
  );
  _onboarding = this._routeData.pipe(map((data) => data.onboarding));

  constructor(
    private route: ActivatedRoute,
    private modalController: ModalController,
    public elem: ElementRef
  ) {
    this._onboarding.pipe().subscribe((_) => _);

    this.presentOnboardingModal().then((m) => m.present());
  }

  private async presentOnboardingModal() {
    const modal = await this.modalController.create({
      component: OnboardingComponent,
      breakpoints: [0.5, 1],
      initialBreakpoint: 0.5,
    });

    modal.onWillDismiss().then((x) => x);

    return modal;
  }
}

export type Tab2Data = {
  onboarding: boolean;
};
