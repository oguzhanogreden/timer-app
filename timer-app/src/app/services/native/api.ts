// TODO: Organize
import {
  LocalNotifications,
  ScheduleOptions
} from '@capacitor/local-notifications';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const apiFactory = () => {
  const api: NotificationApi = {
    notifyNow: () => notify(),
    requestPermission: () => checkPermissions(),
  };

  return api;
};

export type NotificationApi = {
  requestPermission: () => Observable<boolean>; // TODO: Account for third option
  notifyNow: () => Observable<null>;
};

type PermissionCheckApi = () => Observable<boolean>;

type Permitted = 'prompt';

const checkPermissions: PermissionCheckApi = () => {
  return from(LocalNotifications.checkPermissions()).pipe(
    map((status) => status.display),
    map((value: Permitted) => value === 'prompt')
  );
};

// TODO: Fix
type NotifyApi = () => Observable<null>;
const notify: NotifyApi = () => {
  const options: ScheduleOptions = {
    notifications: [
      {
        body: 'test',
        title: 'asd',
        id: 1,
      },
    ],
  };
  return from(LocalNotifications.schedule(options)).pipe(map((_) => null));
};
