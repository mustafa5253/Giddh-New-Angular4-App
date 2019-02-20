import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-tally-sync',
  templateUrl: './tallySync.component.html',
  styleUrls: ['./tallySync.component.scss']
})

export class TallySyncComponent implements OnInit {
  public max: number = 200;
  public showWarning: boolean;
  public dynamic: number;
  public type: string;

  public currentTab: boolean = true;
  public oldTab: boolean = false;

  public ngOnInit(): void {
    //
  }

  public currentButton() {
    this.currentTab = !this.currentTab;
    this.oldTab = false;
    this.currentTab = true;
  }

  public oldButton() {
    this.oldTab = !this.oldTab;
    this.currentTab = false;
  }

}
