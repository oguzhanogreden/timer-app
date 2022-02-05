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

  storeTimers(timers: TimerDto[]) {
    for (let timer of timers) {
      this.storageService.set(timer.id, timer)
    }
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
