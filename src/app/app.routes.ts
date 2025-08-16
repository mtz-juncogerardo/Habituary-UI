import {Routes} from '@angular/router';
import {AuthGuard} from './services/auth-guard.service';
import {LoginPageComponent} from './pages/login/login.page';
import {DashboardPageComponent} from './pages/dashboard/dashboard.page';
import {AppWrapperComponent} from './components/app-wrapper/app-wrapper.component';
import {ProfilePageComponent} from './pages/profile/profile.page';
import {HabitPageComponent} from './pages/habit/habit.page';
import {HabitListPageComponent} from './pages/habit-list/habit-list.page';

export const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {
    path: '',
    component: AppWrapperComponent,
    canActivate: [AuthGuard],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'dashboard'},
      {path: 'dashboard', component: DashboardPageComponent},
      {path: 'habit-list', component: HabitListPageComponent},
      {path: 'profile', component: ProfilePageComponent},
      {path: 'habit', component: HabitPageComponent}, // nuevo hábito
      {path: 'habit/:irn', component: HabitPageComponent}
    ]
  },
  {path: '**', redirectTo: 'dashboard'}
];
