import { Component, OnChanges, OnInit, Input, ViewChild } from '@angular/core';
import * as d3 from "d3";


@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.css']
})
export class HeatMapComponent implements OnInit, OnChanges {
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


  redraw(){
    if (!this.matrix) return;

    var fixedDecisions = {};
    var tasting = this.tasting;

    Object.keys(this.decisions).filter(k=>!k.startsWith("$")).forEach(d=> {
        var decision = this.decisions[d];
        var fixed = [];
        fixedDecisions[d] = fixed;
        for (var foodNum=0;foodNum<this.tasting.options.length;foodNum++){
            var foodIdx = this.tasting.answers.indexOf(foodNum);
            var sum = d3.sum(decision[foodIdx]) || .0001;
            fixed.push(decision[foodIdx].map(p=>p/sum))
        }
        });


    var decisions = fixedDecisions;

    var numDeciders = Object.keys(decisions).length;

    var decisionMass = [];

    decisions[Object.keys(decisions)[0]].forEach(function(r){
    var row = [];
    decisionMass.push(row);
        r.forEach(function(c){
            row.push([]);
        });
    });

    Object.keys(decisions).forEach(function(d){
    var decider = decisions[d];
    decider.forEach(function(row, i){
        row.forEach(function(col, j){
        decisionMass[i][j].push(col);
        })
    })
    });

    var data = decisionMass;

    var colorRamp = d3.scaleLinear()
    .domain([0,Object.keys(decisions).length])
    .range(["white" as any,"black" as any]);

    this.matrix.nativeElement.innerHTML = "";
    var svg = d3.select(this.matrix.nativeElement);
    svg
      .attr("width", tasting.options.length * 100)
      .attr("height", tasting.options.length * 100);

    var rows = svg.selectAll("g.rowg").data(data)
    .enter()
    .append("g")
    .classed("rowg", true);

    var cols = rows.selectAll("g.colg").data(function(d, i){
        return d.map(function(cell){
            return {
            total: cell.reduce(function(a,b){return a+b;}, 0),
            deets: cell,
                    row: i
            };
        });
    }).enter()
        .append("g")
        .classed("colg", true)
        .attr("transform", function(d: any,col){
        return "scale(1) translate("+col*100+", "+d.row*100+") ";
    });

    var boxes = cols
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", function(d:any, j){
        return colorRamp(d.total);
    })
    .attr("width", 100)
    .attr("height",100);

    var histogram = cols.append("g")
    .attr("transform", "translate(35,35) scale(.33)");

    histogram.append("rect").classed("whitey", true)
    .attr("x", 0)
    .attr("y", 0)
    .attr("stroke", "white")
    .attr("fill-opacity", 0)
    .attr("width", 100)
    .attr("height", 100);

    var y = d3.scaleLinear()
        .domain([0, numDeciders])
        .range([10, 90]);

    var x = d3.scaleLinear()
        .domain([0, 5])
        .range([10, 90]);

    histogram
    .selectAll("rect.histbar")
    .data(function(d:any, i){
        var ret= d3.histogram().domain([0,1]).thresholds(5)(d.deets);
        return ret.map(function(a){return a.length});
    })
    .enter()
    .append("rect")
    .classed("histbar", true)
    .attr("x", function(d,i){return x(i)})
    .attr("y", function(d,i){return 95-y(d)})
    .attr("width", 20)
    .attr("height", function(d,i){return y(d)})
    .attr("fill", "#BF8B00");

    svg.selectAll("g.rowg").selectAll("g.colg")
    .append("title")
    .text(function(d:any,j){
    return "Tasting: " + tasting.options[d.row] +
           "\nGuessing: " + tasting.options[j] +
           "\nProbability mass: " + d.total.toFixed(2)+"\n";
    })

  }
}
