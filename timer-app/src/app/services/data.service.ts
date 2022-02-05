import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';
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
  constructor(private stateService: StateService) {
    this.storeUpdated$.subscribe({
      next: store => this.writeStoreToState(store)
    })
  // TODO: getTimer()

  addTimer(timer: Timer) {
    return combineLatest([
      timer.name$,
      timer.startedAt$.pipe(map((s) => s.toMillis())),
      timer.id$,
    ])
      .pipe(
        map(([name, startedAt, id]) => ({
            id: id,
            name: name,
            startedAt: startedAt,
          } as TimerState)
        ),
        tap(state => this.stateService.addTimer(state)),
        filter(_ => false)
      )
  }
  
  modifyTimer(timer: Timer) {
      // timer.stoppedAt$.pipe(map(dt => dt?.toMillis())).subscribe(_ => console.log(_))
    return zip(
      timer.id$,
      timer.name$,
      timer.startedAt$.pipe(map(dt => dt.toMillis())),
      timer.stoppedAt$.pipe(map(dt => dt?.toMillis()))
    ).pipe(
      // tap(_ => console.log(_)),
      map(([id, name, startedAt, stoppedAt]) => ({id: id, name: "asd",stoppedAt: stoppedAt, startedAt: startedAt} as TimerUpdate)),
      // tap(_ => console.log(_)),
      switchMap(update => this.stateService.modifyTimer(update)), 
      filter(_ => false))
  }
  
  timers$ = this.stateService.timers$.pipe(
      map((timerStates) =>
        timerStates
        // .filter(state => !state.stoppedAt) // Here's why stopping works like deleting.
        .map(
          (state) =>
            new Timer({
              name: state.name,
              startedAtMilliseconds: state.startedAt,
              stoppedAtMilliseconds: state.stoppedAt,
              id: state.id,
            })
        )
      )
    );

  private storedTimers() {}
  
  private timerToUpdate() {

  }

  private writeStoreToState(store: ServiceState) {
    this.stateService.storeTimers(store.timers.map(x => ({
      id: x.id,
      name: x.name,
      remindEveryMinutes: x.remindEveryMinutes.toMillis() / (60**2),
      startedAt: x.startedAt.toMillis(),
      stoppedAt: x.stoppedAt?.toMillis(),
    } as TimerDto)))
  }
}
