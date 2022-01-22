import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
import { StateService, TimerState } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private stateService: StateService) {}

  // TODO: getTimer()

  addTimer(timer: Timer) {
    console.log('addtimer is called');
    combineLatest([
      timer.name$,
      timer.startedAt$.pipe(map((s) => s.toMillis())),
    ])
      .pipe(
        map(([name, startedAt]) => {
          let timerState: TimerState = {
            id: timer.id,
            name: name,
            startedAt: startedAt,
          };
          return timerState;
        })
      )
      .subscribe((state) => this.stateService.addTimer(state));
  }

  loadTimers() {
    return this.stateService.timers$.pipe(
      map((timerStates) =>
        timerStates.map(
          (state) =>
            new Timer({
              name: state.name,
              startedAtMilliseconds: state.startedAt,
              id: state.id,
            })
        )
      )
    );
  }

  private storedTimers() {}
}
