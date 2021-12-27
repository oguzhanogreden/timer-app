import { of, Subject, timer } from 'rxjs';
import { filter, map, shareReplay, switchMap, take } from 'rxjs/operators';

export class Timer {
  private _timerTick = of(1000);
  private _reminderAt = of(1000 * 60 * 18);
  private _timerStarted = new Subject();

  timer$ = this._timerStarted.pipe(
    switchMap((_) => this._timerTick),
    switchMap((tick) => timer(0, tick)),
    shareReplay()
  );

  reminder$ = this._timerStarted.pipe(
    switchMap((_) => this._reminderAt),
    switchMap((reminderAt) =>
      this.timer$.pipe(
        filter((t) => reminderAt < t),
        take(1)
      )
    ),
    map((_) => null),
    shareReplay()
  );

  constructor() {
    this.timer$.subscribe();
    this.reminder$.subscribe();
  }

  startTimer() {
    this._timerStarted.next();
    this._timerStarted.complete();
  }
}
