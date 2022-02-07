import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab1PageRoutingModule } from './tab1-routing.module';
import { Tab1Page } from './tab1.page';
import { TimerComponent } from './timer/timer.component';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    Tab1PageRoutingModule
  ],
  declarations: [Tab1Page, TimerComponent]
})
export class Tab1PageModule {}
