import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {}
  
  requestPermissions() {
    this.notificationService.checkPermission()
  }
}
