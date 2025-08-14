import {Routes} from '@angular/router';
import {AuthGuard} from './services/auth-guard.service';
import {LoginPageComponent} from './pages/login/login.page';
import {DashboardPageComponent} from './pages/dashboard/dashboard.page';
import {AppWrapperComponent} from './components/app-wrapper/app-wrapper.component';
import {ProfilePageComponent} from './pages/profile/profile.page';

export const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {
    path: '',
    component: AppWrapperComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'dashboard', component: DashboardPageComponent},
      {path: 'profile', component: ProfilePageComponent}
    ]
  },
  {path: '**', redirectTo: 'dashboard'}
];
