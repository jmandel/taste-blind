import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../state.service';

import { AngularFire, FirebaseListObservable } from 'angularfire2';

@Component({
  selector: 'view-tasting',
  templateUrl: './view-tasting.component.html',
  styleUrls: ['./view-tasting.component.css']
})

export class ViewTastingComponent {
  who: string;
  tastingQuery: any;
  tasting: any;
  decisions: any;
  name: any;
  af: any;
  constructor(
    private stateService: StateService,
    public route: ActivatedRoute,
    af: AngularFire) {
    this.af = af;
    route.params.subscribe(p => {
      this.stateService
        .getTastingAndDecisions(p["name"])
        .subscribe((res: any) => {
          this.who = res.who
          this.tasting = res.tasting;
          this.decisions = res.decisions;
          this.name = p["name"]
        });
    });
  }

  delete() {
    this.tastingQuery.remove(this.tasting.$key);
  }

  onUpdate(index, e) {
    var key = this.tasting.$key;
    var submission: any = this.af.database.object(`/decisions/${key}/${this.who}`);
    submission.update({ [index]: e });
  }

}
