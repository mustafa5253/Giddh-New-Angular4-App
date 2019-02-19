import {Component, OnDestroy, OnInit} from "@angular/core";

@Component({
  selector: 'app-tally-sync',
  templateUrl: './tallySync.component.html',
  styleUrls: ['./tallySync.component.scss']
})

export class TallySyncComponent implements OnInit {
  max: number = 200;
  showWarning: boolean;
  dynamic: number;
  type: string;

  public currentTab: boolean = false;
  public oldTab: boolean = false;

  ngOnInit(): void {
  }

  currentButton() {
    this.currentTab = !this.currentTab;
    this.oldTab = false;
  }

  oldButton() {
    this.oldTab = !this.oldTab;
this.currentTab = false;
  }

}
