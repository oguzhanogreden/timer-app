import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Duration } from 'luxon';
import { map, tap } from 'rxjs/operators';
import { Timer } from './timer.model';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, AfterViewInit {
  @Input()
  timer: Timer;

  timerView: Duration | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.timer.timer$
      .pipe(
        map((t) => Duration.fromObject({ seconds: t })),
        tap((t) => (this.timerView = t))
      )
      .subscribe();
  }

  ngAfterViewInit(): void {}
}
