import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DateTime, Duration } from 'luxon';
import { interval, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  scan,
  switchMap,
  take,
} from 'rxjs/operators';

type FormValue = {
  goal: number;
};

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
})
export class ExploreContainerComponent implements OnInit {
  @Input() name: string;

  private _startTimerClick = new Subject();

  private _time = new Subject<DateTime>();
  time$ = this._time.pipe(map((t) => t.toFormat('HH:mm', { locale: 'nl-NL' })));

  private _timerTicks = new Subject();

  timer$ = this._timerTicks.pipe(
    scan(
      (acc, _) =>
        acc >= Duration.fromObject({ minutes: 15 })
          ? acc.plus(TIMER_TICK * 60)
          : acc.plus(TIMER_TICK * 60 * 5),
      Duration.fromMillis(0)
    )
  );

  form = this.formBuilder.group({
    goal: this.formBuilder.control(18, [Validators.required]),
  });
  formValue$ = this.onFormValueChange();
  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    interval(100).subscribe((_) => this._time.next(DateTime.now()));

    this.onStartTimer();
  }

  submitGoalForm() {
    this.timer$
      .pipe(
        filter(
          (t) =>
            t >
            Duration.fromObject({ minutes: (<FormValue>this.form.value).goal })
        ),
        take(2)
      )
      .subscribe({
        next: console.log,
      });
  }

  private onFormValueChange() {
    return this.form.valueChanges.pipe(distinctUntilChanged());
  }

  private onStartTimer() {
    this._startTimerClick
      .pipe(switchMap((_) => createTimer()))
      .subscribe((_) => this._timerTicks.next());
  }

  startTimer() {
    this._startTimerClick.next();
  }
}

const TIMER_TICK = 1000;
function createTimer() {
  return interval(TIMER_TICK);
}
