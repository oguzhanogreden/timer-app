import { of, Subject, timer } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';

export class Timer {
  private _timerTick = of(1000);
  private _timerStarted = new Subject();

  timer$ = this._timerStarted.pipe(
    switchMap((_) => this._timerTick),
    switchMap((tick) => timer(0, tick)),
    shareReplay()
  );

  constructor() {
    this.timer$.subscribe();
  }

  startTimer() {
    this._timerStarted.next();
    this._timerStarted.complete();
  }
}
