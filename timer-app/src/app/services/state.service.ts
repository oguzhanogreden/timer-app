import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import { distinctUntilChanged, filter, map, mergeAll, switchMap, tap, toArray } from 'rxjs/operators';
import { StorageService } from './storage.service';

export type TimerState = { id: string; name: string; startedAt: number; stoppedAt?: number };
export type TimerUpdate = { id: string; name?: string; startedAt?: number; stoppedAt?: number };

type StateServiceError = 'RESTORE_ERROR';

@Injectable({
  providedIn: 'root',
})
export class StateService implements OnDestroy {
  private _timers = new BehaviorSubject<TimerState[]>([]);
  timers$ = this._timers.pipe();

  constructor(private storageService: StorageService) {
    this.restoreTimersFromStorage().subscribe({
      next: (timers) => this._timers.next(timers),
      error: (err) => console.log(err),
      complete: () => console.log(),
    });

    this.storeOnStateChange().subscribe();
  }

  private getStoredTimerStates() {
    return this.storageService.storedObjects().pipe(
      mergeAll(),
      filter((x) => isTimerState(x)),
      map((x) => x as TimerState),
      toArray()
    );
  }

  private restoreTimersFromStorage() {
    return this._timers.getValue().length === 0
      ? this.getStoredTimerStates()
      : throwError('RESTORE_ERROR' as StateServiceError);
  }

  private storeOnStateChange = () =>
    this._timers.pipe(
      mergeAll(),
      tap(_ => console.log(_)),
      distinctUntilChanged((left, right) => left.stoppedAt == right.stoppedAt),
      // tap(_ => console.log(_)),
      switchMap((t) => this.storageService.set(t.id, t))
    );

  addTimer(timer: TimerState) {
    const timers = [...this._timers.getValue(), timer];

    this._timers.next(timers); // scan map potential for collecting objects
    return this.timers$;
  }

  modifyTimer(timerUpdate: TimerUpdate) {
    const timers = this._timers.getValue();

    this._timers.next(
      timers.map((t) => {
        if (t.id === timerUpdate.id) {
          console.log(t)
          return { ...t, ...timerUpdate } as TimerState;
        }
        console.warn(`Timer with id can't be modified because it does not exist, you've passed: ${timerUpdate.id}`)

        return t;
      })
    );
    
    return this.timers$;
  }

  deleteTimer(timer: TimerState) {
    const timers = this._timers.getValue();

    this._timers.next(timers.filter((t) => t.id !== timer.id));
  }

  ngOnDestroy(): void {
    // this._timers.
  }
}

function isTimerState(object: TimerState | any): object is TimerState {
  const timer = object as TimerState;

  return (
    timer.id !== undefined &&
    timer.name !== undefined &&
    timer.startedAt !== undefined
  );
}
