import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import { BehaviorSubject }    from 'rxjs/BehaviorSubject';
import { Observable }    from 'rxjs';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class StateService {
  // Observable string sources
  public who = null;
  public auth: any;

  constructor(public af:AngularFire,
    public route: ActivatedRoute,
  ) {

    this.auth = af.auth.defaultIfEmpty(null);

    this.auth.subscribe(a => {
      if (!a) {
        this.who = {uid: null, auth: {}}
        return;
      }
      this.who = {
          uid: a.uid,
          displayName: a.auth.displayName,
          email: a.auth.email,
          };
      af.database.object(`/users/${this.who.uid}`).set(this.who);
    });
  }

  getTastingAndDecisions(name: string){

    var tastings =  this.af.database.list(`/tastings/`, {
         query: {
            orderByChild: "name",
            equalTo: name,
            limitToFirst: 1
         }
     })

   var authentications = this.af.auth.filter(auth=> !!auth && !!auth.uid);
   var authenticatedTastings = Observable
     .combineLatest(tastings, authentications);

   var decisions = authenticatedTastings
    .flatMap(([x, auth])=>
      this.af.database.object('/decisions/'+x[0].$key+'/'+auth.uid));

    return Observable.combineLatest(authenticatedTastings, decisions).map(([[t,auth],d])=>{
          return {
            decisions: d,
            name: name,
            tasting: t[0],
            who: auth.uid
          };
    });
  }


  getManageDetails(name: string){

    var tastings = this.af.auth
      .filter(auth=> !!auth && !!auth.uid)
      .flatMap(a => this.af.database.list(`/tastings/`, {
         query: {
            orderByChild: "name",
            equalTo: name,
            limitToFirst: 1
       }}));

    var decisions = tastings.flatMap(tlist => {
       var key = tlist[0].$key;
       return this.af.database.object(`/decisions/${key}`);
    });

    return Observable.combineLatest(
       tastings, decisions
      ).map(([tastings, decisions]) => {
      console.log("LAtest", tastings, decisions);
        return {
          decisions: decisions,
          name: name,
          tastingList: this.af.database.list(`/tastings/`),
          tasting: tastings[0]
        }
    });
  }

  getDisplayNameFor(uid: string){
    return this.af.database.object(`/users/${uid}/displayName`);
  }


}
