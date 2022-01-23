import { DateTime, Duration } from 'luxon';
import {
  combineLatest,
  merge,
  NEVER,
  of,
  ReplaySubject,
  Subject,
  timer
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
  take,
  tap
} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

type Command = 'start' | 'stop';
export type State = 'ticking' | 'paused';

type TimerConfiguration = {
  // tickEveryMilliseconds: number,
  remindEveryMinutes: Duration;
  // name: string
};

const DEFAULT_REMINDER = Duration.fromObject({ minutes: 5 });

export class Timer {
  id: string;

  private _startedAt = new ReplaySubject<DateTime>(1);
  public startedAt$ = this._startedAt.pipe();

  // private _alreadyElapsed = ;

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
    this._timerStarted.pipe(map((_) => 'start' as Command)),
    this._timerStopped.pipe(map((_) => 'stop' as Command))
  ).pipe(shareReplay());

  _state = new Subject<State>();
  state$ = this._state.pipe(shareReplay(1));

  timer$ = this._commands.pipe(
    switchMap((command) => {
      if (command === 'start') {
        // this._timerPrecision.pipe(
        return combineLatest([
          this._timerPrecision,
          this.startedAt$.pipe(
            take(1),
            map((s) => DateTime.now().toMillis() - s.toMillis()),
            shareReplay(1)
          ),
        ]).pipe(
          tap((_) => this._state.next('ticking')),
          switchMap(([timerPrecision, alreadyElapsed]) =>
            // TODO: Should ticks if e.g. startTime changes?
            //       Does it matter if startTime changed 0.01 past the tick or tick-0.01 past it?
            timer(0, timerPrecision).pipe(
              skip(1), // Ignore first tick so that we can emit 0 to begin with
              map((_) => timerPrecision),
              startWith(alreadyElapsed) // Emit 0 to begin with
            )
          )
        );
      } else {
        return of('paused' as State).pipe(
          tap((state) => this._state.next(state)),
          switchMap((_) => NEVER)
        );
      }
    }),
    scan((passedMillis, tick) => passedMillis + tick, 0),
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

  constructor({
    id = uuidv4(),
    name = 'New timer',
    startedAtMilliseconds = DateTime.now().toMillis(), // DateTime.now().minus(Duration.fromObject({hour: 1})).toMillis()
  }: { id?: string; name?: string; startedAtMilliseconds?: number } = {}) {
    this.id = id;
    this._name.next(name);
    this._startedAt.next(DateTime.fromMillis(startedAtMilliseconds));

    // TODO: Smelly
    this.timer$.subscribe();
    this.reminder$.subscribe();
    this.state$.subscribe();
    this._commands.subscribe();

    this.startTimer();
  }
  
  resumeTimer() {
    this.startTimer()
  }

  stopTimer() {
    this._timerStopped.next();
  }

  private startTimer() {
    this._timerStarted.next();
  }

}
