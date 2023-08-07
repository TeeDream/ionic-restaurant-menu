import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from '@src/app/auth/pages/auth/auth.component';
import { LogInComponent } from '@src/app/auth/components/log-in/log-in.component';
import { RegisterComponent } from '@src/app/auth/components/register/register.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'log-in',
        pathMatch: 'full',
      },
      {
        path: 'log-in',
        component: LogInComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
