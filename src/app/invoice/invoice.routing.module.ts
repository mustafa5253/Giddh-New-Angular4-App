import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TooltipModule } from 'ngx-bootstrap';
import { NeedsAuthentication } from '../services/decorators/needsAuthentication';
import { InvoiceComponent } from './invoice.component';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvoiceGenerateComponent } from './generate/invoice.generate.component';
import { InvoiceTemplatesComponent } from './templates/invoice.templates.component';

import { InvoicePreviewComponent } from './preview/invoice.preview.component';
import { InvoiceCreateComponent } from './create/invoice.create.component';
import { InvoiceTemplatesModule } from './templates/invoice.templates.module';
import { EditInvoiceComponent } from './templates/edit-template/edit.invoice.component';

import { FontPickerModule } from 'ngx-font-picker';
import { FontPickerConfigInterface } from 'ngx-font-picker';
import { NgUploaderModule } from 'ngx-uploader';
import { DesignFiltersContainerComponent } from './templates/edit-template/filters-container/design-filters/design.filters.component';
import { EditFiltersContainersComponent } from './templates/edit-template/filters-container/edit.filters.component';

const FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  // Change this to your Google API key
  apiKey: 'AIzaSyAPcvNvidnjQL-a_2xW2QYox3hT7DQBWyo'
};

const INVOICE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [NeedsAuthentication],
    component: InvoiceComponent,
    children: [
      { path: 'preview',  component: InvoicePreviewComponent  },
      { path: 'generate',  component: InvoiceGenerateComponent },
      {
        path: 'templates',  children: [
          { path: '', component: InvoiceTemplatesComponent  },
          { path: 'list', component: EditInvoiceComponent },
          { path: 'list/:templateUniqueName',   },
          // { path: ':templateUniqueName',  component: InvoiceTemplatesComponent }
        ]
       },
      { path: 'settings',   },
    ]
  }
];

@NgModule({
  declarations: [
    InvoiceComponent,
    InvoicePreviewComponent,
    InvoiceGenerateComponent,
    InvoiceTemplatesComponent,
    EditInvoiceComponent,
    InvoiceCreateComponent,
    DesignFiltersContainerComponent,
    EditFiltersContainersComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(INVOICE_ROUTES),
    TooltipModule.forRoot(),
    InvoiceTemplatesModule,
    FontPickerModule.forRoot(FONT_PICKER_CONFIG),
    NgUploaderModule
  ],
  exports: [
    RouterModule,
    TooltipModule
  ],
  providers: []
})
export class InvoiceRoutingModule { }
