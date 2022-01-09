import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Duration } from 'luxon';
import { debounceTime, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { Timer, TimerState } from './timer.model';

type FormValue = {
  remindEveryMinutes: number;
};

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, AfterViewInit {
  @Input()
  timer: Timer;

  @Output()
  reminder = new EventEmitter<null>();

  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      remindEveryMinutes: this.formBuilder.control(null, [Validators.min(1)]),
    });

    this.timer.config$
      .pipe(
        map((config) => config.remindEveryMinutes.toMillis() / (1000 * 60)),
        take(1)
      )
      .subscribe((remindEveryMinutes) =>
        this.form.setValue({ remindEveryMinutes } as FormValue)
      );

    this.form.get('remindEveryMinutes').valueChanges
      .pipe(
        debounceTime(200),
        // TODO: Smelly?
        filter(_ => this.form.get('remindEveryMinutes').valid),
        distinctUntilChanged(),
      )
      .subscribe({
        next: (remindEveryMinutes) =>
          this.timer.setRemindEveryMinutes(remindEveryMinutes),
      });

    this.timer.reminder$.pipe(tap((_) => this.reminder.emit())).subscribe({
      // next: (x) => console.log(x),
      error: console.error,
    });
  }

  ngAfterViewInit(): void {}

  onToggleButtonClick(timerState: TimerState) {
    switch (timerState) {
      case 'ticking':
        this.timer.stopTimer();
        break;
      case 'paused':
        this.timer.startTimer();
        break;
    }
  }
}

@Pipe({ name: 'durationFromMilliseconds', pure: true })
export class DurationFromSecondsPipe implements PipeTransform {
  transform(value: number, ...args: any[]) {
    return Duration.fromMillis(value);
  }
}
