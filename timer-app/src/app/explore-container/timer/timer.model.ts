import { DateTime, Duration } from 'luxon';
import {
  combineLatest,
  merge, Observable, of,
  ReplaySubject,
  Subject,
  timer
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  scan,
  shareReplay,
  skip,
  startWith,
  switchMap
} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

type Command = 'start' | 'stop';
export type State = 'ticking' | 'stopped';

type TimerConfiguration = {
  // tickEveryMilliseconds: number,
  remindEveryMinutes: Duration;
  // name: string
};

const DEFAULT_REMINDER = Duration.fromObject({ minutes: 5 });

export class Timer {
  private _id = new ReplaySubject<string>(1);
  id$ = this._id.asObservable();

  private _startedAt = new ReplaySubject<DateTime>(1);
  public startedAt$ = this._startedAt.pipe();
  
  private _stoppedAt = new ReplaySubject<DateTime | null>(1);
  public stoppedAt$ = this._stoppedAt.pipe();

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
  private _timerStopped = new Subject(); // would be nicer to consider this when stopped at comes, or the other way

  private _commands = merge(
    this._timerStarted.pipe(map((_) => 'start' as Command)),
    // TODO: Consider if these events provide a good design?
    merge([this._timerStopped, this._stoppedAt]).pipe(map((_) => 'stop' as Command)),
  ).pipe(shareReplay());

  // _state = new Subject<State>();
  // state$ = this._state.pipe(shareReplay(1));
  state$: Observable<State> = this._commands.pipe(
    map((command) => {
      switch (command) {
        case 'start':
          return 'ticking';
        case 'stop':
          return 'stopped';
        default:
          let exhausted: never = command;
      }
    })
  );

  onStartTimer() {
    return combineLatest([
      this._timerPrecision,
      this.startedAt$.pipe(
        first(),
        map((s) => DateTime.now().toMillis() - s.toMillis())
      ),
    ]).pipe(
      // tap((_) => this._state.next('ticking')),
      switchMap(([timerPrecision, alreadyElapsed]) =>
        // TODO: Should ticks if e.g. startTime changes?
        //       Does it matter if startTime changed 0.01 past the tick or tick-0.01 past it?
        timer(0, timerPrecision).pipe(
          skip(1), // Ignore first tick so that we can emit 0 to begin with
          map((_) => timerPrecision),
          startWith(alreadyElapsed) // Emit 0 to begin with
        )
      ),
      scan((passedMillis, tick) => passedMillis + tick, 0)
    );
  }
  
  onStopTimer() {
    return combineLatest([
      this.startedAt$,
      this.stoppedAt$
    ]).pipe(
      map(([startedAt, stoppedAt]) => stoppedAt.minus(startedAt.toMillis())),
      map(elapsed => elapsed.toMillis())
    )
  }
      
  timer$ = this._commands.pipe(
    switchMap(command => {
      switch (command) {
        case 'start':
          return this.onStartTimer();
        case 'stop':
          return this.onStopTimer();
        default:
          const exhausted: never = command;
      }
    }),
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
    stoppedAtMilliseconds,
  }: { id?: string; name?: string; startedAtMilliseconds?: number, stoppedAtMilliseconds?: number } = {}) {
    this._id.next(id);
    this._name.next(name);
    this._startedAt.next(DateTime.fromMillis(startedAtMilliseconds));
    this._stoppedAt.subscribe();

    // TODO: Smelly
    this._commands.subscribe();
    this.timer$.subscribe();
    this.reminder$.subscribe();
    this.state$.subscribe();

    if (stoppedAtMilliseconds) {
      this._stoppedAt.next(DateTime.fromMillis(stoppedAtMilliseconds))
      this._timerStopped.next();
    } else {
      this.startTimer();
    }
  }

  stopTimer(): void {
    this._stoppedAt.next(DateTime.now());
    this._timerStopped.next();
  }

  private startTimer() {
    this._timerStarted.next();
  }
}
