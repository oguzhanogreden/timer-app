import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  allowed$ = from(Notification.requestPermission()).pipe(
    first(),
    map((p) => p === 'granted')
  );

  constructor() {}
}
