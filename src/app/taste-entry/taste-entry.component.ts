import { Component, Output, Input, EventEmitter } from '@angular/core';


@Component({
  selector: 'taste-entry',
  templateUrl: './taste-entry.component.html',
  styleUrls: ['./taste-entry.component.css']
})

export class TasteEntryComponent {
  total: any;
  score: any;
  readonly epsilon = 0.0001;
  @Output() onDecision = new EventEmitter();
  @Input() tasting;
  @Input() decision;
  @Input() sample;


  constructor() { };

  ngOnChanges() {
    this.recompute();
  }
  ngOnInit() {
    if (!this.decision || this.decision.length == 0) {
      this.decision = this.tasting.options.map(o => .05);
    }
    this.recompute();
  }

  set(i, event) {
    this.decision[i] = event.value;
    this.recompute();
  }

  recompute() {
    this.total = this.decision.reduce((acc, d) => acc + d, 0);
    this.score = this.decision.map(d => d / (this.total + this.epsilon));
    this.onDecision.emit(this.decision)
  }
}
