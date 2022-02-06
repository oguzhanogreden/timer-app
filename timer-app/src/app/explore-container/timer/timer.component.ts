import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Duration } from 'luxon';
import { of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, take, tap } from 'rxjs/operators';
import { TimerService } from 'src/app/services/timer.service';
import { State, Timer } from './timer.model';

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

  constructor(private formBuilder: FormBuilder, private timerService: TimerService) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      remindEveryMinutes: this.formBuilder.control(null, [Validators.min(1)]),
    });

    of(this.timer.remindEveryMinutes)
      .pipe(
        map((remindEveryMinutes) => remindEveryMinutes.toMillis() / (1000 * 60)),
        take(1)
      )
      .subscribe((remindEveryMinutes) =>
        this.form.setValue({ remindEveryMinutes } as FormValue)
      );

    this.form.get('remindEveryMinutes')?.valueChanges
      .pipe(
        debounceTime(200),
        // TODO: Smelly?
        filter(_ => this.form.get('remindEveryMinutes')?.valid ?? false),
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
  
  onStopTimerClicked(timer: Timer) {
    this.timerService.stopTimer(timer);
  }

  onToggleButtonClick(timerState: State) {
    switch (timerState) {
      case 'ticking':
        this.onStopTimerClicked(this.timer);
        break;
      case 'stopped':
        // TODO: Restart a follow-up timer
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
