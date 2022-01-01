import { merge, NEVER, of, Subject, timer } from 'rxjs';
import {
  filter,
  map,
  scan,
  shareReplay,
  skip,
  switchMap,
  take,
  tap
} from 'rxjs/operators';

type TimerCommand = 'start' | 'stop';
export type TimerState = "ticking" | "paused";

export class Timer {
  private _timerTick = of(1000);
  private _reminderAt = of(1000 * 60 * 18);

  private _timerStarted = new Subject();
  private _timerStopped = new Subject();

  private _commands = merge(
    this._timerStarted.pipe(map((_) => 'start' as TimerCommand)),
    this._timerStopped.pipe(map((_) => 'stop' as TimerCommand))
  ).pipe(shareReplay());
  
  _state = new Subject<TimerState>();
  state$ = this._state.pipe(shareReplay(1));
  
  timer$ = this._commands.pipe(
    switchMap((command) => {
      if (command === 'start') {
        return this._timerTick.pipe(
          tap(_ => this._state.next("ticking")),
          switchMap((tick) =>
            timer(0, tick).pipe(
              skip(1),
              map((_) => tick)
            )
          )
        );
      } else {
        return of("paused" as TimerState)
          .pipe(
            tap(state => this._state.next(state)),
            switchMap(_ => NEVER),
          )
      }
    }),
    scan((passed, tick) => passed + tick, 0),
    shareReplay(1)
  );

  reminder$ = this._timerStarted.pipe(
    switchMap((_) => this._reminderAt),
    switchMap((reminderAt) =>
      this.timer$.pipe(
        filter((t) => reminderAt < t),
        take(1)
        // TODO: Make reminder recurring every `_reminderAt` minutes.
      )
    ),
    map((_) => null),
    shareReplay()
  );

  constructor() {
    this.timer$.subscribe();
    this.reminder$.subscribe();
    this._commands.subscribe();
    this.state$.subscribe();
  }

  startTimer() {
    this._timerStarted.next();
  }

  stopTimer() {
    this._timerStopped.next();
  }
}
