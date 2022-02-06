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

  startNewTimer(): void {
    const timer = new Timer();

    this.dataService.addTimer(timer);
  }
  
  stopTimer(timer: Timer): void {
    timer.stopTimer();
    
    this.dataService.modifyTimer(timer);
  }

  getTimer(t: Timer): Observable<Timer> {
    return this.timers$.pipe(
      mergeAll(),
      filter((timer) => timer === t)
    );
  }
}
