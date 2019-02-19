import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ModalModule, ProgressbarModule} from "ngx-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {LaddaModule} from "angular2-ladda";
import {TallySyncRoutingModule} from "./tallySync.routing.module";
import {TallySyncComponent} from "./tallySync.component";

@NgModule({
  declarations: [
    TallySyncComponent
  ],
  exports: [
    TallySyncComponent
  ],
  imports: [
    CommonModule,
    ModalModule,
    FormsModule,
    ReactiveFormsModule,
    LaddaModule,
    TallySyncRoutingModule,
    ProgressbarModule.forRoot()
  ]
})

export class TallySyncModule {
}
