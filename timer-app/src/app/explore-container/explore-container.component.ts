import { Component, Input, OnInit } from '@angular/core';
import { DateTime } from 'luxon';
import { Subject, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { TimerService } from '../services/timer.service';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  private _time = new Subject<DateTime>();
  time$ = this._time.pipe(map((t) => t.toFormat('HH:mm', { locale: 'nl-NL' })));

  constructor(
    private timerService: TimerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    timer(0, 60 * 1000).subscribe((_) => this._time.next(DateTime.now()));
  }

  timers$ = this.timerService.timers$;

  startTimer() {
    this.notificationService.checkPermission()
    this.timerService.startNewTimer()
    
    return;
  }
}
