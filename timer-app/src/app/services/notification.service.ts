import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { TimerService } from './timer.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  _allowed = new Subject<boolean>();
  allowed$ = this._allowed.pipe();

  constructor(
    private toastController: ToastController,
    private timerService: TimerService
  ) {
    this.handleNotificationsNotAllowed();
    this.handleTimerNotifications();
  }

  requestPermission() {
    Notification.requestPermission().then(
      (allowed) => this._allowed.next(allowed === 'granted') // TODO: What happens with "default"?
    );
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
      .subscribe(
        (name) => new Notification(`You've reached your goal for ${name}`)
      );
  }
}
