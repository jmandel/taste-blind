import { Component, OnInit } from '@angular/core';

import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { StateService } from '../state.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'new-tasting',
  templateUrl: './new-tasting.component.html',
  styleUrls: ['./new-tasting.component.css']
})

export class NewTastingComponent {
  tastings: FirebaseListObservable<any[]>;
  values: string;
  name: string;
  constructor(public af: AngularFire,
    public stateService: StateService,
    public router: Router
  ) {
    this.tastings = af.database.list('/tastings');
    this.name = "";
    this.values = "";
  }

  ready() {
    if (!this.name) { return false; }
    if (this.values.split(/,/).map(x => x.trim()).length < 2) { return false; }
    return true;
  }

  save() {
    this.tastings.push({
      name: this.name,
      options: this.values.split(/,/)
        .map(x => x.trim())
        .filter(x => !!x)
        .sort(),
      uid: this.stateService.who.uid,
      open: true
    })
    this.router.navigate(['/taste/' + this.name]);
  }
}

