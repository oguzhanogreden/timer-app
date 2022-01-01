import { Component, Input, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { DateTime } from 'luxon';
import { interval, Subject } from 'rxjs';
import { map, scan } from 'rxjs/operators';
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

  private _time = new Subject<DateTime>();
  time$ = this._time.pipe(map((t) => t.toFormat('HH:mm', { locale: 'nl-NL' })));

  private _startTimerClick = new Subject();

  constructor(
    private toastController: ToastController,
    private timerService: TimerService
  ) {}

  ngOnInit() {
    interval(100).subscribe((_) => this._time.next(DateTime.now()));

    this.onStartTimer();
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

  timers$ = this.timerService.timers$.pipe(
    scan((timers, t) => [...timers, t], [] as Array<Timer>)
  );

  startTimer() {
    this._startTimerClick.next();
  }

  private onStartTimer() {
    this._startTimerClick.subscribe((_) => this.timerService.startTimer());
  }
}

const TIMER_TICK = 1000;
function createTimer() {
  return interval(TIMER_TICK);
}
