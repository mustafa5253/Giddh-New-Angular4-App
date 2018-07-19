import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { WindowRef } from '../shared/helpers/window.object';
import { ModalDirective, TabsetComponent } from 'ngx-bootstrap';

@Component({
  selector: 'onboarding-component',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']

})

export class OnboardingComponent implements OnInit {
  @ViewChild('talkSalesModal') public talkSalesModal: ModalDirective;
  @ViewChild('supportTab') public supportTab: TabsetComponent;
  public loadAPI: Promise<any>;
  constructor(private _router: Router, private _window: WindowRef) {
      this._window.nativeWindow.superformIds = ['Jkvq'];
  }

  public ngOnInit() {
    //
  this.loadAPI = new Promise((resolve) => {
      this.loadScript();
      resolve(true);
  });
  }

  public goTo(path: string) {
    this._router.navigate([path], { queryParams: { tab: 'permission', tabIndex: 5 } });
  }

  public scheduleNow() {
    let newwindow = window.open('https://app.intercom.io/a/meeting-scheduler/calendar/VEd2SmtLSyt2YisyTUpEYXBCRWg1YXkwQktZWmFwckF6TEtwM3J5Qm00R2dCcE5IWVZyS0JjSXF2L05BZVVWYS0tck81a21EMVZ5Z01SQWFIaG00RlozUT09--c6f3880a4ca63a84887d346889b11b56a82dd98f', 'scheduleWindow', 'height=650,width=1199,left=200,top=100`');
    if (window.focus) {
        newwindow.focus();
    }
      return false;
  }

  public openScheduleModal() {
    this.talkSalesModal.show();
  }

public loadScript() {
    let isFound = false;
    let scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; ++i) {
        if (scripts[i].getAttribute('src') != null && scripts[i].getAttribute('src').includes('loader')) {
            isFound = true;
        }
    }

    if (!isFound) {
        let dynamicScripts = ['https://random-scripts.herokuapp.com/superform/superform.js'];

        for (let i = 0; i < dynamicScripts .length; i++) {
            let node = document.createElement('script');
            node.src = dynamicScripts [i];
            node.type = 'text/javascript';
            node.async = false;
            node.charset = 'utf-8';
            document.getElementsByTagName('head')[0].appendChild(node);
        }

    }
}

public closeModal() {
  this.talkSalesModal.hide();
}
  // public downloadPlugin() {
  //   window.location = 'https://s3.ap-south-1.amazonaws.com/giddhbuildartifacts/Walkover+Prod.tcp';
  // }
}