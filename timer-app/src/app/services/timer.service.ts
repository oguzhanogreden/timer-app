import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, mergeAll } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  timers$ = this.dataService.loadTimers();

  constructor(private dataService: DataService) {}

  startNewTimer(): Observable<any> {
    const timer = new Timer();

    return this.dataService.addTimer(timer).pipe(filter(_ => false));
  }
  
  stopTimer(t: Timer): Observable<any> {
    t.stopTimer();
    
    return this.dataService.modifyTimer(t).pipe(filter(_ => false));
  }

  getTimer(t: Timer): Observable<Timer> {
    return this.timers$.pipe(
      mergeAll(),
      filter((timer) => timer === t)
    );
  }
}
