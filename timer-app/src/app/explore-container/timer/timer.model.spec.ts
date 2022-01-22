import { DateTime } from 'luxon';
import { take } from 'rxjs/operators';
import { Timer } from './timer.model';

describe('TimerModel', () => {
  it('shoud emit the correct time passed with empty constructor', () => {
	  let now = DateTime.now();
	  let timer = new Timer();
	  
	  timer.startTimer()

	  timer.timer$.pipe(take(1)).subscribe(t => {
		  expect(t.toMillis()).toBeGreaterThanOrEqual(0)
		  expect(t.toMillis()).toBeLessThan(10); // Just to make sure it doesn't overshoot.
		})
  })

  it('shoud emit the correct time passed when constructed with startedAt in past', () => {
	  let now = DateTime.now();
	  let startedAt = now.minus({ minutes: 30 }).toMillis();
	  let timer = new Timer({id: "test", name: "test", startedAt: startedAt});
	  
	  timer.startTimer()
	  
	  let elapsed = now.minus(startedAt).toMillis() + 1;

	  timer.timer$.pipe(take(1)).subscribe(t => {
		  expect(t.toMillis()).toBeGreaterThanOrEqual(elapsed)
		  expect(t.toMillis()).toBeLessThan(elapsed + 10); // Just to make sure it doesn't overshoot.
		})
  })
});
