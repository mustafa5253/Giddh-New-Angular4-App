import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NeedsAuthentication } from '../decorators/needsAuthentication';
import { ReportsComponent } from './reports.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '', component: ReportsComponent, canActivate: [NeedsAuthentication],
      }
    ])
  ],
  exports: [RouterModule]
})

export class ReportsRoutingModule {

}
