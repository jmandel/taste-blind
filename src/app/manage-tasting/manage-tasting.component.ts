import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StateService } from '../state.service';

@Component({
  selector: 'app-manage-tasting',
  templateUrl: './manage-tasting.component.html',
  styleUrls: ['./manage-tasting.component.css']
})
export class ManageTastingComponent {
  public decisions: any;
  public name: string;
  public scores: any[];
  public users: any;
  public winner: string;
  public tasting: any;
  public checkedUsers: any;
  private tastingList: any;
  private trigger = 0;

  constructor(
    private stateService: StateService,
    public route: ActivatedRoute,
  ) {
    route.params.subscribe(p => {
      this.stateService
        .getManageDetails(p["name"])
        .subscribe((res: any) => {
          this.tasting = res.tasting;
          this.tasting.answers = this.tasting.answers || [];
          this.tastingList = res.tastingList;
          this.decisions = res.decisions;
          this.name = res.name
          this.users = Object.keys(this.decisions)
                       .filter(k=>!k.startsWith("$"))
                       .reduce((acc,uid)=>{
                         acc[uid] = this.stateService.getDisplayNameFor(uid);
                         return acc;
                       }, {});

          this.checkedUsers = {};
          Object.keys(this.users).forEach(u=>{
            this.checkedUsers[u] = true;
          });
          if (!this.tasting.open) {
            this.scores = this.score();
          }
        });
    });

  }

  allActive(){
    Object.keys(this.checkedUsers).forEach(uid=>this.checkedUsers[uid] = true)
    this.logChange()
  }

  noneActive(){
    Object.keys(this.checkedUsers).forEach(uid=>this.checkedUsers[uid] = false)
    this.logChange()
  }

  logChange(){
    console.log("CHange!", this.checkedUsers);
    this.trigger += 1;
  }

  toggle(player){
    if(player.uid){
        this.checkedUsers[player.uid] = !this.checkedUsers[player.uid];
        this.trigger += 1;
    }
  }

  errors() {
    if (this.tasting.answers.length !== this.tasting.options.length ||
      this.tasting.answers.indexOf(-1) !== -1) {
      return "Not all samples have been assigned to a true value";
    }

    var numericAnswers = this.tasting.answers.map(i => parseInt(i));

    if (this.tasting.options
      .map((o, i) => numericAnswers.indexOf(i))
      .filter(i => i > -1)
      .length !== this.tasting.options.length) {
      return "Not all samples have been assigned";
    }

    return "";
  }

  productForSample(i: number) {
    return this.tasting.options[i];
  }

  endTasting() {
    this.tasting.answers = Object.keys(this.tasting.options)
      .map((_, i) => {
        var ret = parseInt(this.tasting.answers[i])
        if (isNaN(ret)) { return -1; }
        return ret;
      });

    this.tasting.open = false;
    this.scores = this.score();

    var update = {
      open: this.tasting.open,
      answers: this.tasting.answers
    };

    this.tastingList.update(this.tasting.$key, update);
  }

  score(): any {
    var ret: any;
    ret = Object.keys(this.decisions)
      .filter(x => !x.startsWith("$"))
      .map(k => {
        var ret: any;
        ret = {
          uid: k,
          displayName: this.stateService.getDisplayNameFor(k),
          score: scorePlayer(this.decisions[k], this.tasting.answers)
        };
        return ret;
      }).concat([{
        name: "RANDOM CHANCE",
        score: this.tasting.answers.length * Math.log(1 / this.tasting.answers.length)
      }]).sort((a, b) => b.score - a.score);

    return ret;
  }
}

function scorePlayer(guessList, answers) {
  return guessList
    .map((guesses, i) => guesses[answers[i]] / guesses.reduce((a, b) => a + b, 0.00001))
    .map(g => Math.log(g))
    .reduce((total, v) => total + v, 0);
}
