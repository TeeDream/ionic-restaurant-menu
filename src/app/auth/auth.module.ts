import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LogInComponent } from '@src/app/auth/components/log-in/log-in.component';
import { SharedModule } from '@src/app/shared/shared.module';
import { RegisterComponent } from '@src/app/auth/components/register/register.component';
import { AuthComponent } from '@src/app/auth/pages/auth/auth.component';

@NgModule({
  declarations: [LogInComponent, RegisterComponent, AuthComponent],
  imports: [CommonModule, AuthRoutingModule, SharedModule],
})
export class AuthModule {}
