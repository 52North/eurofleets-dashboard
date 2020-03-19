import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './views/dashboard/dashboard.component';
import { TrajectoriesViewComponent } from './views/trajectories/view.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'trajectories',
    component: TrajectoriesViewComponent
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
