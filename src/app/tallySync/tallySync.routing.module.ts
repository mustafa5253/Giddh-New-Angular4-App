import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {NeedsAuthentication} from "../decorators/needsAuthentication";
import {TallySyncComponent} from "./tallySync.component";

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '', component: TallySyncComponent , canActivate: [NeedsAuthentication]
      }
    ])
  ],
  exports: [RouterModule]
})

export class TallySyncRoutingModule {

}
