import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export const apiFactory = () => {
  const platform = Capacitor.getPlatform();
  return {
    requestPermission: () => {
      switch (platform) {
        case 'ios':
          return checkPermissions();
        case 'web':
          // Notification.requestPermission().then(
          //   (allowed) => this._allowed.next(allowed === 'granted') // TODO: What happens with "default"?
          // );

          return of(true);
        case 'android':
          return of(false);
      }
    },
  };
};

export type NotificationApi = {
  requestPermission: () => Observable<boolean>; // TODO: Account for third option
};

type PermissionCheckApi = () => Observable<boolean>;

type Permitted = 'prompt';

const checkPermissions: PermissionCheckApi = () => {
  return from(LocalNotifications.checkPermissions()).pipe(
    map((status) => status.display),
    map((value: Permitted) => value === 'prompt')
  );
};
