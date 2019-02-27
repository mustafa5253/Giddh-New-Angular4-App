import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-report-data-component',
  templateUrl: './report-data.component.html',
  styleUrls: [`./report-data.component.scss`]
})

export class ReportDataComponent implements OnInit {
  public showAccountSearch = false;
  public showNumberSearch = false;
  public showProductServiceSearch = false;
  public imgPath: string;
  public isModalOpen: boolean = false;

  public ngOnInit(): void {
    this.imgPath = isElectron ? 'assets/icon/' : AppUrl + APP_FOLDER + 'assets/icon/';
  }

  public toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }
}
