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
  
  // TODO: Reconcile "subjecting state to good beh." & "facades talk"
  //       1. TimerService could become TimerFacade (and go immutable)
  //       2. Would we then still want DataService to exist to support e.g. optimistic updates?
  changeReminderFrequency(timer: Timer, frequencyInMinutes: number) {
    timer.setRemindEveryMinutes(frequencyInMinutes);
    
    this.dataService.modifyTimer(timer);
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
