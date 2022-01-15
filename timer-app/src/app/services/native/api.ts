// TODO: Organize
import { PermissionState } from '@capacitor/core';
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export const apiFactory = () => {
  const api: NotificationApi = {
    notifyNow: (body: string, title: string) => notify(body, title),
    checkPermission: () => checkPermissions(),
    requestPermission: () => requestPermission(),
  };

  return api;
};

export type NotificationApi = {
  checkPermission: CheckPermissionApi; // TODO: Account for third option
  notifyNow: NotifyApi;
  requestPermission: RequestPermissionApi;
};

type CheckPermissionApi = () => Observable<boolean>;

type Permission = Permitted | Ask;

type Permitted = 'granted';
type Ask = 'prompt';

const checkPermissions: CheckPermissionApi = () => {
  return from(LocalNotifications.checkPermissions()).pipe(
    map((status) => status.display),
    map((value: Permission) => value === 'granted')
  );
};

type NotifyApi = (body: string, title: string) => Observable<null>;
const notify: NotifyApi = (body: string, title: string) => {
  const options: ScheduleOptions = {
    notifications: [
      {
        body: body,
        title: title,
        id: new Date().getTime() + Math.floor(Math.random() * 10),
        summaryText: body,
        sound: null,
        // schedule: {
        //   // at: new Date(Date.now() + 1),
        // },
      },
    ],
  };
  return from(LocalNotifications.schedule(options)).pipe(map((_) => null));
};

type RequestPermissionApi = () => Observable<PermissionState>;
const requestPermission: RequestPermissionApi = () =>
  from(LocalNotifications.requestPermissions()).pipe(
    map((status) => status.display)
  );
