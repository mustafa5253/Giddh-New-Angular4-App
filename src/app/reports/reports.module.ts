import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportDataComponent } from './components/report-data/report-data.component';
import { ReportChartComponent } from './components/report-chart/report-chart.component';
import { ReportContainerComponent } from './components/report-container/report-container.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    PerfectScrollbarModule,
    BsDropdownModule
  ],
  exports: [
    ReportsComponent
  ],
  declarations: [
    ReportsComponent,
    ReportDataComponent,
    ReportChartComponent,
    ReportContainerComponent
  ]
})

export class ReportsModule {

}
