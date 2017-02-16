import { Component } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2';

import { Pipe, PipeTransform } from '@angular/core';

import { Router } from '@angular/router';
import { StateService } from './state.service';

@Pipe({name: 'alpha'})
export class AlphaPipe implements PipeTransform {
  transform(value: number): string {
    return String.fromCharCode(65+value);
  }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  providers: [StateService]
})

export class AppComponent {
  tastings: FirebaseListObservable<any[]>;
      constructor(private stateService: StateService,
        public router: Router
      ) {
    this.tastings = stateService.af.database.list('/tastings');
  }

  login() {
    this.stateService.af.auth.login();
  }

  logout() {
     this.stateService.af.auth.logout();
     this.router.navigate(['/']);
  }

  loggedIn() {
  }
}



