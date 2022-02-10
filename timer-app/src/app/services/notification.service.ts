import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { apiFactory, NotificationApi } from './native/api';
import { TimerService } from './timer.service';

type NotificationWrapper = {
  notificationApi: NotificationApi;
};

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements NotificationWrapper {
  private readonly _allowed = new Subject<boolean>();
  public readonly allowed$ = this._allowed.pipe(shareReplay(1));

  constructor(
    private toastController: ToastController,
    private timerService: TimerService
  ) {
  }

  notificationApi: NotificationApi = apiFactory();

  checkPermission() {
    this.notificationApi.checkPermission().subscribe({
      next: (allowed) => this._allowed.next(allowed),
    });
  }
  
  requestPermission(): Observable<null> {
    return this.notificationApi.requestPermission().pipe(
      map(_ => null)
    )
  }

  public notifyUser(timerName: string) {
    this.notificationApi.notifyNow('Ping!', timerName).subscribe(() => {});
  }
}
