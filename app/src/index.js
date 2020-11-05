import * as d3 from "d3";
import { HEIGHT, WIDTH } from "./models/constants";
import { View } from "./views/view";

async function main() {
  let data = await d3.csv("src/models/data.csv");
  data.forEach((d) => {
    d.year = parseInt(d.year);
    d.depicts = d.depicts.split(";").map((x) => x.trim());
  });
  
  d3.select("body").attr("style", "margin: 0px;");

  let svg = d3
    .select("body")
    .append("svg")
    .attr("height", HEIGHT)
    .attr("width", WIDTH);

  const view = new View(svg, data);

  const views = {
    default: view
  };

  const filterState = {};

  function filterByKey(key) {
    let newData = data;
    for (const [filKey, val] of Object.entries(filterState)) {
      if (val && filKey != key) {
        newData = newData.filter(val);
      }
    }
    return newData;
  }

  function refresh() {
    for (const key of Object.keys(views)) {
      views[key].update(filterByKey(key));
    }
  }

  function makeUpdater(key) {
    return function update(filterFunc) {
      // filterFunc is null if there is no filter
      filterState[key] = filterFunc;
      refresh();
    };
  }

  view.initialize(data, makeUpdater("default"));
}

main();
