import { Component } from '@angular/core';
import { filter } from 'rxjs/operators';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private notification: NotificationService) {
    // TODO: Warn user if notifications are not allowed?
    this.notification.allowed$
      .pipe(filter((allowed) => !allowed))
      .subscribe(console.log);
  }
}
