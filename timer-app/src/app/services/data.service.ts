import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, mergeAll, take, toArray } from 'rxjs/operators';
import { Timer } from '../explore-container/timer/timer.model';
import { StateService } from './state.service';

type ServiceState = {
  timers: Timer[],
}
let _state: ServiceState = {
  timers: [],
}
export type TimerDto = { id: string; name: string; startedAt: number; stoppedAt?: number, remindEveryMinutes: number };

@Injectable({
  providedIn: 'root',
})
export class DataService {
  _store = new BehaviorSubject<ServiceState>(_state);
  storeUpdated$ = this._store.asObservable();

  timers$ = this._store.pipe(map(s => s.timers));

  constructor(private stateService: StateService) {
    this.readTimersFromStateOnConstruction()
      .subscribe(timers => {
        _state = {..._state, timers: timers};
        this._store.next(_state)
      });
    
    this.storeUpdated$.subscribe({
      next: store => this.writeStoreToState(store)
    });
  }

  addTimer(timer: Timer) {
    _state = {..._state, timers: [..._state.timers, timer] }

    this._store.next(_state)
  }
    
  modifyTimer(timer: Timer) {
    const _timers = [
      ..._state.timers.filter(t => t.id !== timer.id),
      timer
    ];

    _state = {..._state, timers: _timers}
    
    this._store.next(_state);
  }

  private readTimersFromStateOnConstruction() {
    return this.stateService.timers$.pipe(
      take(1),
      mergeAll(),
      map((timerState) => new Timer({
          name: timerState.name,
          startedAtMilliseconds: timerState.startedAt,
          stoppedAtMilliseconds: timerState.stoppedAt,
          id: timerState.id,
          remindEveryMinutes: timerState.remindEveryMinutes,
        }),
      ),
      toArray()
    )
  }
  
  private writeStoreToState(store: ServiceState) {
    this.stateService.storeTimers(store.timers.map(x => ({
      id: x.id,
      name: x.name,
      remindEveryMinutes: x.remindEveryMinutes.toMillis() / (1000 * 60),
      startedAt: x.startedAt.toMillis(),
      stoppedAt: x.stoppedAt?.toMillis(),
    } as TimerDto)))
  }
}
