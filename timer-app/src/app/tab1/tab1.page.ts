import { Component } from '@angular/core';
import { DateTime } from 'luxon';
import { Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { TimerService } from '../services/timer.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private _time = new Subject<DateTime>();
  time$ = this._time.pipe(map((t) => t.toFormat('HH:mm', { locale: 'nl-NL' })));

  constructor(
    private timerService: TimerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    timer(0, 60 * 1000).subscribe((_) => this._time.next(DateTime.now()));
  }

  timers$ = this.timerService.timers$.pipe(map(timers => timers.sort((a, b) => a.startedAt.toMillis() - b.startedAt.toMillis())));

  startTimer() {
    this.notificationService.checkPermission()
    this.timerService.startNewTimer()
    
    return;
  }
}
