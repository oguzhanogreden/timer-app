import { Injectable } from '@angular/core';
import { BehaviorSubject, from, throwError } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { TimerDto } from './data.service';
import { StorageService } from './storage.service';

export type TimerUpdate = { id: string; name?: string; startedAt?: number; stoppedAt?: number, remindEveryMinutes: number };

type StateServiceError = 'RESTORE_ERROR';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private _timers = new BehaviorSubject<TimerDto[]>([]);
  timers$ = this._timers.pipe(filter(x => x.length !== 0), take(1), );

  constructor(private storageService: StorageService) {
    from(this.restoreTimersFromStorage()).subscribe({
      next: (timers) => this._timers.next(timers),
      error: (err) => console.log(err),
      complete: () => console.log(),
    });
  }

  storeTimers(timers: TimerDto[]) {
    for (let timer of timers) {
      this.storageService.set(timer.id, timer)
    }
  }

  private async getStoredTimerStates(): Promise<TimerDto[]> {
    return this.storageService.storedObjects()
      .then(objects => objects.filter(x => isTimerState(x)) as TimerDto[])
    
  }

  private restoreTimersFromStorage() {
    this.getStoredTimerStates().then(_ => console.log(_));
    return this._timers.getValue().length === 0
      ? this.getStoredTimerStates()
      : throwError('RESTORE_ERROR' as StateServiceError);
  }
}

function isTimerState(object: TimerDto | any): object is TimerDto {
  const timer = object as TimerDto;

  return (
    timer.id !== undefined &&
    timer.name !== undefined &&
    timer.startedAt !== undefined
  );
}
