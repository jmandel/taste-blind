import { Component, OnChanges, OnInit, Input, ViewChild } from '@angular/core';
import * as d3 from "d3";


@Component({
  selector: 'app-diagnostic',
  templateUrl: './diagnostic.component.html',
  styleUrls: ['./diagnostic.component.css']
})
export class DiagnosticComponent implements OnInit {
  @Input() tasting;
  @Input() decisions;
  @ViewChild("matrix") matrix;

  constructor() { }

  ngOnInit() {
    this.redraw();
  }

  ngOnChanges() {
    this.redraw();
  }

  onResize() {
    this.redraw();
  }

  redraw() {

    var host = this;

    var width = this.matrix.nativeElement.getBoundingClientRect().width;
    var virtualWidth = 100;
    var virtualHeight = 100;
    var scaleFactorWidth = width / virtualWidth;
    var scaleFactorHeight = width / virtualHeight;

    var numOptions = this.tasting.options.length;

    // Normalize so each tasting has a probability if 1
    // and re-order so decisions are ordered by sample-number
    // so the "A,B" confusion probability is at [0][1].
    var numDeciders =  Object.keys(this.decisions)
      .filter(k => !k.startsWith("$"))
      .length;
 
    var decisions = Object.keys(this.decisions)
      .filter(k => !k.startsWith("$"))
      .map(person=>this.decisions[person].map(d=>{
          var sum = d3.sum(d) + .00001;
          return d.map(p => p / sum);
      }))
      .reduce((acc, p)=>{
        p.forEach(r=>r.forEach(v=>acc.push(v)));
        return acc;
      }, []);

    d3.select(this.matrix.nativeElement)
      .attr("width", width)
      .attr("height", width*2);

    var svg = d3.select(this.matrix.nativeElement)
      .select("g.root")
      .attr("transform", `scale(${scaleFactorWidth}, ${scaleFactorHeight})`);

    var dataHistogram = d3.histogram().domain([0, 1]).thresholds(20)(decisions);

    var x = d3.scaleLinear()
      .domain([0, numDeciders * numOptions * numOptions ])
      .range([0, 88]);

    var rows = svg.selectAll("g.rowg")
      .data(dataHistogram.map(a=>a.length));

    var newRows = rows
      .enter()
      .append("g")
      .classed("rowg", true)
      .attr("transform", (d,i)=>`translate(0, ${i*10})`);

    newRows
      .append("rect")
      .attr("x", 12)
      .attr("y", 0)
      .attr("height", 10);

    newRows.append("text")
        .attr("font-size", "5")
        .attr("y", "7")
        .attr("x", "0")
        .text((d, i)=> `${i*5}%`);

    newRows
        .merge(rows)
        .select("rect")
        .attr("width", d=>x(d));

  }

}
