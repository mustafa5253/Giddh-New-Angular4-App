import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar/dist';
import { ManageGroupsAccountsComponent, AccountsSideBarComponent } from './header/components';
import { Ng2BootstrapModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    // Components / Directives/ Pipes
    LayoutComponent, HeaderComponent, FooterComponent, AccountsSideBarComponent,
    ManageGroupsAccountsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PerfectScrollbarModule,
    Ng2BootstrapModule.forRoot()
  ],
  exports: [LayoutComponent, HeaderComponent, FooterComponent],
  entryComponents: [ManageGroupsAccountsComponent]
})
export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: []
    };
  }
}