import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-reports-component',
  templateUrl: './reports.component.html',
  styleUrls: [`./reports.component.scss`]
})

export class ReportsComponent implements OnInit {
  public selectedFy: string = null;

  public ngOnInit(): void {
    //
  }

}
