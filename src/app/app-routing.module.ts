import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './views/dashboard/dashboard.component';
import { ShipSelectionComponent } from './views/ship-selection/ship-selection.component';
import { TrajectoriesViewComponent } from './views/trajectories/view.component';

const routes: Routes = [
  { path: 'dashboard/:id', component: DashboardComponent },
  { path: 'trajectories/:id', component: TrajectoriesViewComponent },
  { path: 'selection', component: ShipSelectionComponent },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'selection'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
