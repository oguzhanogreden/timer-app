import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private _timers = new ReplaySubject<Timer>();
  timers$ = this._timers.pipe();

  constructor() {}

  startTimer(): Timer {
    const timer = new Timer();

    this._timers.next(timer);

    timer.startTimer();

    return timer;
  }

  getTimer(t: Timer) {
    return this._timers.pipe(filter((timer) => timer === t));
  }
}