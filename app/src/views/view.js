import * as d3 from "d3";
import { HEIGHT, WIDTH } from "../models/constants";

/**
 * View object
 */
export class View {
  /**
   * Takes in SVG d3 object and data
   */
  constructor(svg, allData) {
    this.defaultG = svg.append("g").classed("default", true);
    this.allData = allData;
    this.viewWidth = WIDTH;
    this.viewHeight = HEIGHT;
  }

  /**
   * Takes in filtered data object
   */
  initialize(data, onFilter) {
    if (data) {
      // Set the onFilter function to be a boolean function when filtering
      onFilter(function (d) {
        return true;
      });
    }
    this.update(data);
  }

  /**
   * Takes in filtered data object
   */
  update(data) {
    const self = this;

    this.defaultG
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", self.viewWidth)
      .attr("height", self.viewHeight)
      .attr("fill", "green")
      .attr("stroke", "black");
  }
}
