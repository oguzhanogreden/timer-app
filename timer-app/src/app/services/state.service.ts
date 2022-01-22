import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, throwError } from 'rxjs';
import {
  filter,
  map,
  mergeAll,
  switchMap,
  take,
  tap,
  toArray
} from 'rxjs/operators';
import { StorageService } from './storage.service';

export type TimerState = { id: string; name: string; startedAt: number };
export type TimerUpdate = { id: string; name?: string; startedAt?: number };

type StateServiceError = 'RESTORE_ERROR';

@Injectable({
  providedIn: 'root',
})
export class StateService implements OnDestroy {
  private _timers = new BehaviorSubject<TimerState[]>([]);
  timers$ = this._timers.pipe();

  constructor(private storageService: StorageService) {
    this.restoreTimersFromStorage().subscribe({
      // next: (timers) => this._timers.next(timers),
      error: (err) => console.log(err),
      complete: () => console.log(),
    });

    this.storeOnStateChange().subscribe();
  }

  private getStoredTimerStates() {
    return this.storageService.storedObjects().pipe(
      tap((_) => console.log(_)),
      take(1),
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
      tap((_) => console.log(_)),
      mergeAll(),
      switchMap((t) => {
        console.log(t.name);
        return this.storageService.set(t.id, t);
      })
    );

  addTimer(timer: TimerState) {
    const timers = this._timers.getValue();

    // TODO: Why is this throwing?
    this._timers.next([...timers, timer]);
  }

  modifyTimer(timerUpdate: TimerUpdate) {
    const timers = this._timers.getValue();

    this._timers.next(
      timers.map((t) => {
        if (t.id === timerUpdate.id) {
          return { ...t, ...timerUpdate } as TimerState;
        }

        return t;
      })
    );
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
