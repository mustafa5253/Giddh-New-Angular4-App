import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-report-container-component',
  templateUrl: './report-container.component.html',
  styleUrls: [`./report-container.component.scss`]
})

export class ReportContainerComponent implements OnInit {
  public selectedFy: string = null;
  @Output('selectedFyEvent') public selectedFyEvent: EventEmitter<string> = new EventEmitter();

  public ngOnInit(): void {
    //
  }
}
