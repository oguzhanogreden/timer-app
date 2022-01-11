import { Duration } from 'luxon';
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
  remindEveryMinutes: Duration;
  // name: string
};

const DEFAULT_REMINDER = Duration.fromObject({ minutes: 5 });

export class Timer {
  private _timerPrecision = of(1000);
  private _reminderAt = new Subject<Duration>();
  private _name = new ReplaySubject<string>(1);
  name$ = this._name.pipe();

  config$ = combineLatest([
    this._reminderAt.pipe(startWith(DEFAULT_REMINDER)),
  ]).pipe(
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
        return this._timerPrecision.pipe(
          tap((_) => this._state.next('ticking')),
          switchMap((tick) =>
            timer(0, tick).pipe(
              skip(1),
              map((_) => tick),
              startWith(0)
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
    scan((passedMillis, tick) => passedMillis + tick * 60, 0),
    map((passedMillis) => Duration.fromMillis(passedMillis)),
    shareReplay(1)
  );

  reminder$ = this._timerStarted.pipe(
    switchMap((_) => this.config$),
    map((config) => config.remindEveryMinutes),
    switchMap((reminderAt, reminderIndex) => {
      return this.timer$.pipe(
        map((t) => Math.floor(t.toMillis() / reminderAt.toMillis())),
        // If "reminder" changed, let the first value pass so that distinctUntilChanged will not filter `1`
        filter((severity) => (reminderIndex === 0 ? severity > 0 : true)),
        distinctUntilChanged(),
        // If "reminder" changed, _ will be 0 when timerIndex===0, we'd like to pass:
        filter((_, timerIndex) => {
          return reminderIndex === 0 || (reminderIndex > 0 && timerIndex !== 0);
        })
      );
    }),
    shareReplay()
  );

  setRemindEveryMinutes(m: number) {
    this._reminderAt.next(Duration.fromObject({ minutes: m }));
  }

  constructor(timerName?: string) {
    this._name.next(timerName ?? 'New timer');

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
