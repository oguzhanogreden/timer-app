import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, of, Subject } from 'rxjs';
import { filter, mergeMap, shareReplay, switchMap } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
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

  timers$: Observable<Timer>;

  constructor(
    private toastController: ToastController,
    private timerService: TimerService
  ) {
    this.timers$ = timerService.timers$;

    this.checkPermission();
    this.handleNotificationsNotAllowed();
    this.handleTimerNotifications();
  }

  notificationApi: NotificationApi = apiFactory();

  checkPermission() {
    this.notificationApi.checkPermission().subscribe({
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
    this.timers$
      .pipe(
        mergeMap((t) => t.state$.pipe(filter((x) => x === 'ticking'))),
        switchMap((s) => of(null))
      )
      .subscribe((_) => this.displayNotificationNotAllowedToast());
  }

  private handleTimerNotifications() {
    this.timers$
      .pipe(mergeMap((t) => t.reminder$.pipe(switchMap((_) => t.name$))))
      // TODO: Investigate - Notification() works differently for Chrome [= no sound] and Firefox [= sound]
      .subscribe((name) =>
        this.notificationApi.notifyNow('Ping!', name).subscribe(() => {})
      );
  }
}
