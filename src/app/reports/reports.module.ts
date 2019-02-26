import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportsComponent } from './reports.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportDataComponent } from './components/report-data/report-data.component';
import { ReportChartComponent } from './components/report-chart/report-chart.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule
  ],
  exports: [
    ReportsComponent
  ],
  declarations: [
    ReportsComponent,
    ReportDataComponent,
    ReportChartComponent
  ]
})

export class ReportsModule {

}
