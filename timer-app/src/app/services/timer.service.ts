import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, mergeAll } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  timers$ = this.dataService.timers$;

  constructor(private dataService: DataService) {}

  startNewTimer(): Observable<any> {
    const timer = new Timer();

    return this.dataService.addTimer(timer).pipe(filter(_ => false));
  }
  
  stopTimer(timer: Timer): Observable<any> {
    timer.stopTimer();
    
    return this.dataService.modifyTimer(timer).pipe(filter(_ => false));
  }

  getTimer(t: Timer): Observable<Timer> {
    return this.timers$.pipe(
      mergeAll(),
      filter((timer) => timer === t)
    );
  }
}
