import { Injectable } from '@angular/core';
import { filter, mergeAll } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  timers$ = this.dataService.loadTimers()

  constructor(private dataService: DataService) {
  }

  startNewTimer(): Timer {
    const timer = new Timer();
    this.dataService.addTimer(timer);

    return timer;
  }

  getTimer(t: Timer) {
    return this.timers$.pipe(mergeAll(), filter((timer) => timer === t));
  }
}
