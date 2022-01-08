import {
  combineLatest,
  merge,
  NEVER,
  of,
  ReplaySubject,
  Subject,
  timer,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  shareReplay,
  skip,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';

type TimerCommand = 'start' | 'stop';
export type TimerState = 'ticking' | 'paused';

type TimerConfiguration = {
  // tickEveryMilliseconds: number,
  remindEveryMinutes: number;
  // name: string
};

export class Timer {
  private _timerTick = of(1000);
  private _reminderAt = new Subject<number>();
  private _name = new ReplaySubject<string>(1);
  name$ = this._name.pipe();

  config$ = combineLatest([this._reminderAt.pipe(startWith(1000 * 10))]).pipe(
    // TODO Update constant
    map(
      ([remindEveryMinutes]) =>
        ({
          remindEveryMinutes,
        } as TimerConfiguration)
    ),
    distinctUntilChanged(),
    shareReplay(1)
  );

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
          tap((_) => this._state.next('ticking')),
          switchMap((tick) =>
            timer(0, tick).pipe(
              skip(1),
              map((_) => tick)
            )
          )
        );
      } else {
        return of('paused' as TimerState).pipe(
          tap((state) => this._state.next(state)),
          switchMap((_) => NEVER)
        );
      }
    }),
    scan((passed, tick) => passed + tick, 0),
    shareReplay(1)
  );

  // TODO: Prevent resetting at every reminderAt
  reminderSeverity$ = this._timerStarted.pipe(
    switchMap((_) => this.config$),
    tap((_) => console.log(_)),
    map((_) => _.remindEveryMinutes),
    switchMap((reminderAt) =>
      this.timer$.pipe(
        map((t) => Math.floor(t / reminderAt)),
        filter((severity) => severity > 0),
        distinctUntilChanged()
      )
    ),
    // TODO: Throttle?
    shareReplay()
  );

  setRemindEveryMinutes(m: number) {
    this._reminderAt.next(m);
  }

  constructor(timerName?: string) {
    this._name.next(timerName ?? 'New timer');

    this.timer$.subscribe();
    this.reminderSeverity$.subscribe();
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
