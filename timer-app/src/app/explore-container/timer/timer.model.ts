import { DateTime, Duration } from 'luxon';
import {
  merge, NEVER, Observable, of, ReplaySubject, Subject,
  timer
} from 'rxjs';
import {
  distinctUntilChanged,
  filter, map,
  scan,
  shareReplay,
  skip,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

	type Command = 'start' | 'stop' | 'restore';
export type State = 'ticking' | 'stopped';

const DEFAULT_REMINDER = Duration.fromObject({ minutes: 5 });

export class Timer {
  readonly id: string;
  startedAt: DateTime;
  stoppedAt: DateTime | null;
  name: string;
  // TODO: Refactor - decide where the representation changes from Duration to number
  remindEveryMinutes = DEFAULT_REMINDER

  private _timerPrecision = 1000;
  private _reminderAt = new Subject<Duration>();
  private _timerStarted = new Subject();
  private _timerStopped = new Subject(); // would be nicer to consider this when stopped at comes, or the other way
  private _timerRestored = new ReplaySubject<null>(1);
  private timerRestored$ = this._timerRestored.pipe(takeUntil(this._timerStarted));

  // TODO: Consider if these events provide a good design?
  private _commands = merge(
    this._timerStarted.pipe(map((_) => 'start' as Command)),
    this.timerRestored$.pipe(map((_) => 'restore' as Command)),
    this._timerStopped.pipe(map((_) => 'stop' as Command))
  ).pipe(shareReplay(1));

  // _state = new Subject<State>();
  // state$ = this._state.pipe(shareReplay(1));
  state$: Observable<State> = this._commands.pipe(
    map((command) => {
      switch (command) {
        case 'start':
        case 'restore':
          return 'ticking' as State;
        case 'stop':
          return 'stopped' as State;
        default:
          let exhausted: never = command;
          throw "Not exhausted";
      }
    })
  );

  onStartTimer() {
    const alreadyElapsed = DateTime.now().toMillis() - this.startedAt.toMillis();

    // TODO: Should ticks if e.g. startTime changes?
    //       Does it matter if startTime changed 0.01 past the tick or tick-0.01 past it?
    return timer(0, this._timerPrecision).pipe(
      skip(1), // Ignore first tick so that we can emit 0 to begin with
      map((_) => this._timerPrecision),
      startWith(alreadyElapsed) ,
      scan((passedMillis, tick) => passedMillis + tick * 50, 0)
    );
  }
  
  onStopTimer() {
    if (this.stoppedAt === null) {
      this.stoppedAt = DateTime.now();
    }
    const elapsed = this.stoppedAt.minus(this.startedAt.toMillis())
    
    return of(elapsed.toMillis());
  }
      
  timer$ = this._commands.pipe(
    switchMap(command => {
      switch (command) {
        case 'start':
        case 'restore':
          return this.onStartTimer();
        case 'stop':
          return this.onStopTimer();
        default:
          const exhausted: never = command;
          throw "not exhausted";
      }
    }),
    map((passedMillis) => Duration.fromMillis(passedMillis)),
    shareReplay(1)
  );

  // TODO: Extract to timer factory
  reminder$ = this._commands.pipe(
    switchMap((command, reminderIndex) => {
      let reminder: Observable<number>;
      switch (command) {
        case 'stop':
          return NEVER;
        case 'start':
          reminder = this.timer$.pipe(
            takeUntil(this._timerStopped),
            map((t) => Math.floor(t.toMillis() / this.remindEveryMinutes.toMillis())),
            // If "reminder" changed, let the first value pass so that distinctUntilChanged will not filter `1`
            filter((severity) => (reminderIndex === 0 ? severity > 0 : true)),
            distinctUntilChanged(),
            // If "reminder" changed, _ will be 0 when timerIndex===0, we'd like to pass:
            filter((_, timerIndex) => {
              return reminderIndex === 0 || (reminderIndex > 0 && timerIndex !== 0);
            }),
          )
          return reminder;
        case 'restore':
          // TODO: DRY this!!!
          reminder = this.timer$.pipe(
            takeUntil(this._timerStopped),
            map((t) => Math.floor(t.toMillis() / this.remindEveryMinutes.toMillis())),
            // If "reminder" changed, let the first value pass so that distinctUntilChanged will not filter `1`
            filter((severity) => (reminderIndex === 0 ? severity > 0 : true)),
            distinctUntilChanged(),
            // If "reminder" changed, _ will be 0 when timerIndex===0, we'd like to pass:
            filter((_, timerIndex) => {
              return reminderIndex === 0 || (reminderIndex > 0 && timerIndex !== 0);
            }),
            skip(1),
          );
          console.log(command)
          return reminder;
        default:
          const e: never = command;
          return NEVER;
      }
    }),
  );

  setRemindEveryMinutes(m: number) {
    this._reminderAt.next(Duration.fromObject({ minutes: m }));
  }

  constructor({
    id = uuidv4(),
    name = 'New timer',
    startedAtMilliseconds, // DateTime.now().minus(Duration.fromObject({hour: 1})).toMillis()
    stoppedAtMilliseconds,
  }: { id?: string; name?: string; startedAtMilliseconds?: number, stoppedAtMilliseconds?: number } = {}) {
    this.id = id;
    this.name = name;

    // TODO: Smelly
    this._commands.subscribe();
    this.startTimer(startedAtMilliseconds); // Smelly - where this is placed matters too much! Try moving it one row above
    this.timer$.subscribe();
    this.reminder$.subscribe();
    this.state$.subscribe();

    if (stoppedAtMilliseconds) {
      this.stoppedAt = DateTime.fromMillis(stoppedAtMilliseconds)
      this._timerStopped.next();
    }
  }

  stopTimer(): void {
    this.stoppedAt = DateTime.now();
    this._timerStopped.next();
  }

  private startTimer(startedAt?: number) {
    if (startedAt) {
      this.startedAt = DateTime.fromMillis(startedAt); 
      this._timerRestored.next();
      this._timerRestored.complete();

      return;
    }

    this.startedAt = DateTime.now(); 
    this._timerStarted.next();
  }
}
