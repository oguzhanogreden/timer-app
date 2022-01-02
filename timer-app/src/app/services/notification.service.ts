import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  _allowed = new Subject<boolean>();
  allowed$ = this._allowed.pipe();

  constructor(private toastController: ToastController) {
    this.handleNotificationsNotAllowed();
  }

  requestPermission() {
    Notification.requestPermission().then((allowed) =>
      this._allowed.next(allowed === 'granted') // TODO: What happens with "default"?
    );
  }

  private handleNotificationsNotAllowed() {
    this.allowed$.pipe(filter((x) => !x)).subscribe((_) => this.displayToast());
  }

  private async displayToast() {
    const toast = await this.toastController.create({
      message:
        "You're starting a timer but you've disallowed notifications. This may reduce effectiveness of the app.",
      buttons: [
        {
          text: 'OK!',
          role: 'cancel',
        },
      ],
    });

    await toast.present();
  }
}
