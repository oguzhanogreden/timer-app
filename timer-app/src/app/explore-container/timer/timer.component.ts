import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { Duration } from 'luxon';
import { first, tap } from 'rxjs/operators';
import { Timer } from './timer.model';

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

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.timer.reminder$
      .pipe(
        first(),
        tap((_) => this.reminder.emit())
      )
      .subscribe({
        next: console.log,
        error: console.error,
      });
  }

  ngAfterViewInit(): void {}
}

@Pipe({ name: 'durationFromSeconds', pure: true })
export class DurationFromSecondsPipe implements PipeTransform {
  transform(value: number, ...args: any[]) {
    return Duration.fromObject({ seconds: value });
  }
}
