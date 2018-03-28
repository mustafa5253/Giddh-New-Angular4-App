import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Component({
  selector: 'sample-template',
  templateUrl: './sample.template.component.html'
})

export class SampleTemplateComponent implements OnInit, OnDestroy  {
  @Output() public closeAndDestroyComponent: EventEmitter<any> = new EventEmitter();

  public destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor() {
    console.log (`hello from sampleTemplateComponent`);
  }

  public ngOnInit() {
    //
  }

  public ngOnDestroy() {
    //
  }

  public doDestroy() {
    this.closeAndDestroyComponent.emit(true);
  }
}
