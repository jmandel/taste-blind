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
  @Input() users;
  @Input() trigger;
  public activeUsers = [];
  public message = "";
  @ViewChild("matrix") matrix;

  constructor() {
  }

  ngOnInit() {
    this.activeUsers = Object.keys(this.users).filter(u=>this.users[u]);
    console.log("INIT", this.activeUsers);
    this.redraw();
  }

  ngOnChanges() {
    console.log("CHANGE", this.users);
    this.ngOnInit();
  }

  onResize() {
    this.redraw();
  }

  redraw() {

    var host = this;
    var tasting = this.tasting;

    var width = this.matrix.nativeElement.getBoundingClientRect().width;
    var virtualWidth = 200 * tasting.options.length;
    var scaleFactor = width / virtualWidth;

    this.matrix.nativeElement.innerHTML = "";
    var svg = d3.select(this.matrix.nativeElement)
      .attr("width", width)
      .attr("height", width)
      .append("g")
      .attr("transform", "scale(" + scaleFactor + ")");


    function orderBySampleId(decisionRow) {
      return tasting.answers.map(i => decisionRow[i]);
    }


    // Normalize so each tasting has a probability if 1
    // and re-order so decisions are ordered by sample-number
    // so the "A,B" confusion probability is at [0][1].
    if (this.activeUsers.length === 0){
      return;
    }
    var decisions = Object.keys(this.decisions)
      .filter(k => !k.startsWith("$"))
      .filter(k => host.activeUsers.indexOf(k) !== -1)
      .reduce((acc, person) => {
        acc[person] = this.decisions[person].map(d => {
          var sum = d3.sum(d) + .00001;
          return orderBySampleId(d).map(p => p / sum);
        });
        return acc;
      }, {});

    var numDeciders = Object.keys(decisions).length;
    var decisionMass = [];
    decisions[Object.keys(decisions)[0]].forEach(function(r) {
      var row = [];
      decisionMass.push(row);
      r.forEach(function(c) {
        row.push([]);
      });
    });

    Object.keys(decisions).forEach(function(d) {
      var decider = decisions[d];
      decider.forEach(function(row, i) {
        row.forEach(function(col, j) {
          decisionMass[i][j].push(col);
        })
      })
    });

    var colorRamp = d3.scaleLinear()
      .domain([0, Object.keys(decisions).length])
      .range(["white" as any, "black" as any]);

    function hostMessage(d, j) {
      return "Tasting: " + tasting.options[tasting.answers[d.row]] +
        ", \nGuessing: " + tasting.options[tasting.answers[j]] +
        ", \nProbability mass: " + d.total.toFixed(2) + "\n";
    }


    var rows = svg.selectAll("g.rowg").data(decisionMass)
      .enter()
      .append("g")
      .attr("transform", (d, row) => `translate(0, ${row * 100})`)
      .attr("class", (d, row) => `rownum-${row}`)
      .classed("rowg", true);

    rows.append("g")
      .attr("transform", `translate(${virtualWidth / 2 + 5}, 50)`)
      .append("text")
      .text((d, row) => host.tasting.options[tasting.answers[row]] + " (tasted)");

    rows.append("g")
      .attr("transform", (d, row) =>
        `translate(${50 + row * 100}, ${5 + virtualWidth / 2 - 100 * row}) rotate(90)`)
      .append("text")
      .text((d, row) => host.tasting.options[tasting.answers[row]] + " (guessed)");

    var cols = rows.selectAll("g.colg").data(function(d, i) {
      return d.map(function(cell) {
        return {
          total: cell.reduce(function(a, b) { return a + b; }, 0),
          deets: cell,
          row: i
        };
      });
    }).enter()
      .append("g")
      .classed("colg", true)
      .attr("transform", function(d: any, col) {
        return `translate(${col * 100}, 0 )`;
      }).on("click mouseover touch", function(d, j) {
        host.message = hostMessage(d, j);
      });

    var boxes = cols
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", function(d: any, j) {
        return colorRamp(d.total);
      })
      .attr("width", 100)
      .attr("height", 100);

    var histogram = cols.append("g")
      .attr("transform", "translate(25,25) scale(.5)");

    histogram.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("stroke", "white")
      .attr("fill", "white")
      .attr("fill-opacity", .1)
      .attr("width", 100)
      .attr("height", 100);

    var y = d3.scaleLinear()
      .domain([0, numDeciders])
      .range([2, 82]);

    var x = d3.scaleLinear()
      .domain([0, 5])
      .range([10, 90]);

    histogram
      .selectAll("rect.histbar")
      .data(function(d: any, i) {
        var ret = d3.histogram().domain([0, 1]).thresholds(5)(d.deets);
        return ret.map(function(a) { return a.length });
      })
      .enter()
      .append("rect")
      .classed("histbar", true)
      .attr("x", function(d, i) { return x(i) })
      .attr("y", function(d, i) { return 92 - y(d) })
      .attr("width", 20)
      .attr("height", function(d, i) { return y(d) })
      .attr("fill", "#BF8B00");

    svg.selectAll("g.rowg").selectAll("g.colg")
      .append("title")
      .text(function(d: any, j) {
        return hostMessage(d, j);
      })

  }
}
