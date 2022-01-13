import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { of, Subject } from 'rxjs';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { apiFactory, NotificationApi } from './native/api';
import { TimerService } from './timer.service';

type NotificationWrapper = {
  notificationApi: NotificationApi;
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements NotificationWrapper {
  _allowed = new Subject<boolean>();
  allowed$ = this._allowed.pipe(shareReplay(1));

  constructor(
    private toastController: ToastController,
    private timerService: TimerService
  ) {
    this.checkPermission()
    this.handleNotificationsNotAllowed();
    this.handleTimerNotifications();
  }

  notificationApi: NotificationApi = apiFactory();

  checkPermission() {
    this.notificationApi
      .checkPermission()
      .pipe(
        switchMap((granted) =>
        // TODO: DO not request here
          granted ? of(granted) : this.notificationApi.requestPermission()
        )
      )
      .subscribe({
        next: (allowed) => this._allowed.next(allowed),
      });
  }

  private async displayNotificationNotAllowedToast() {
    const toast = await this.toastController.create({
      message:
        "You're starting a timer but you've disallowed notifications. This may reduce effectiveness of the app.",
      duration: 2000,
      buttons: [
        {
          text: 'OK!',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }

  private handleNotificationsNotAllowed() {
    // TODO: If it is later allowed, e.g. due to a new promp while starting a new timer hide all toasts
    this.allowed$
      .pipe(filter((x) => !x))
      .subscribe((_) => this.displayNotificationNotAllowedToast());
  }

  private handleTimerNotifications() {
    this.timerService.timers$
      .pipe(mergeMap((t) => t.reminder$.pipe(switchMap((_) => t.name$))))
      // TODO: Investigate - Notification() works differently for Chrome [= no sound] and Firefox [= sound]
      .subscribe((name) =>
        this.notificationApi
          .notifyNow('Ping!', name)
          .subscribe(() => {})
      );
  }
}
