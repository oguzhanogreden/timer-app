import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { DateTime, Duration } from 'luxon';
import { combineLatest, interval, of, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  startWith,
  switchMap,
  take,
} from 'rxjs/operators';
import { TimerService } from '../services/timer.service';
import { Timer } from './timer/timer.model';

type FormValue = {
  goal: number;
};

const defaultGoal = 18;

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  private _startTimerClick = new Subject();
  private _stopTimerClick = new Subject();

  private _time = new Subject<DateTime>();
  time$ = this._time.pipe(map((t) => t.toFormat('HH:mm', { locale: 'nl-NL' })));

  _active = new Subject<boolean>();

  private _timerTicks = new Subject();
  timer$ = this._active.pipe(
    switchMap((active) =>
      active
        ? this._timerTicks.pipe(
            scan(
              (acc, _) =>
                acc >= Duration.fromObject({ minutes: 15 })
                  ? acc.plus(TIMER_TICK * 60) // Speed up for development
                  : acc.plus(TIMER_TICK * 60 * 5),
              Duration.fromMillis(0)
            )
          )
        : of(Duration.fromMillis(0))
    )
  );

  form = this.formBuilder.group({
    goal: this.formBuilder.control(defaultGoal, [Validators.required]),
  });
  goal$ = this.onFormValueChange();

  goalReached$ = combineLatest([
    this.timer$,
    this.goal$.pipe(startWith(Duration.fromObject({ minute: defaultGoal }))),
  ])
    .pipe(
      filter(([timer, goal]) => timer > goal),
      take(1)
    )
    .subscribe({
      next: () => this.displayToast(),
    });

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private timerService: TimerService
  ) {}

  ngOnInit() {
    interval(100).subscribe((_) => this._time.next(DateTime.now()));

    this.onStartTimer();
    this.onStopTimer();
  }

  private onStopTimer() {
    this._stopTimerClick.subscribe({
      next: (_) => {
        // this._timerTicks.complete();
        // this._timerTicks = new Subject();
        // this.timer$ = this.initializeTimer();
        // this.goalReached$ = this.initializeGoalReached();
      },
    });
    // this._timerTicks.complete();
    // this.÷
  }

  private async displayToast() {
    const toast = await this.toastController.create({
      message: "You've reached your goal, take a break?",
      buttons: [
        {
          text: '',
        },
      ],
    });

    await toast.present();
  }

  private onFormValueChange() {
    return this.form.valueChanges.pipe(
      distinctUntilChanged(),
      map((v: FormValue) => Duration.fromObject({ minute: v.goal }))
    );
  }

  private onStartTimer() {
    this._startTimerClick.subscribe((_) => this.timerService.startTimer());
  }

  timers$ = this.timerService.timers$.pipe(
    scan((timers, t) => [...timers, t], [] as Array<Timer>)
  );

  startTimer() {
    this._active.next(true);
    this._startTimerClick.next();
  }
  stopTimer() {
    this._active.next(false);
    this._stopTimerClick.next();
  }
}

const TIMER_TICK = 1000;
function createTimer() {
  return interval(TIMER_TICK);
}
