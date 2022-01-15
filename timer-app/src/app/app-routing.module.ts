import { NgModule } from '@angular/core';
import { PreloadAllModules, Route, RouterModule } from '@angular/router';

type TypedRoute = Route & {
  path?: AppRoutePath;
};
type TypedRoutes = TypedRoute[];

const routes: TypedRoutes = [
  {
    path: 'onboarding',
    redirectTo: '/tabs/tab2',
    // data: {
    //   onboarding: true,
    // } as Tab2Data, // Ineffective, search #effective
  },
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

export type AppRoutePath = 'onboarding' | '';
