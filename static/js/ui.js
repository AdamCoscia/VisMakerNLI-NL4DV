const globalConfig = {
  tableContainer: "#tableContainer",
  parsedResponse: "#parsedResponse",
  responseContainer: "#responseContainer",
  queryInput: "#queryInput",
  queryBtn: "#queryBtn",
};

function initializeNL4DV() {
  $.post("/init", { dependency_parser: "corenlp" });
  $.post("/setData", { dataset: "movies-w-year.csv" }).done(function (
    response
  ) {
    var columns = Object.keys(response.summary);
    d3.csv("assets/data/movies-w-year.csv").then(function (data) {
      var table = d3.select(globalConfig.tableContainer).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

      // append the header row
      thead
        .append("tr")
        .selectAll("th")
        .data(columns)
        .join("th")
        .text(function (column) {
          return column;
        });

      // create a row for each object in the data
      var rows = tbody.selectAll("tr").data(data).join("tr");

      // create a cell in each row for each column
      var cells = rows
        .selectAll("td")
        .data(function (row) {
          return columns.map(function (column) {
            return { column: column, value: row[column] };
          });
        })
        .join("td")
        .text(function (d) {
          return d.value;
        })
        .on("mouseover", function () {
          d3.select(this).style("background-color", "powderblue");
        })
        .on("mouseout", function () {
          d3.select(this).style("background-color", "white");
        });
    });
  });
}

function runNL4DV(query) {
  $.post("/analyze_query", { query: query }).done(function (response_string) {
    var response = JSON.parse(response_string);

    $(globalConfig.responseContainer).empty();
    $(globalConfig.parsedResponse).empty();

    // Get values
    const status = response["status"],
      dataset = response["dataset"],
      attributeMap = response["attributeMap"],
      taskMap = response["taskMap"],
      visList = response["visList"];

    // Output JSON
    var div = document.createElement("div");
    var tree = jsonTree.create(response, div);
    tree.expand(function (_) {
      return true;
    });
    $(globalConfig.responseContainer).append(div);

    // Create parsed text group
    responseG = d3
      .select(globalConfig.parsedResponse)
      .append("g")
      .classed("parsed", true);

    // Results and dataset
    responseG.append("p").html(`Result: ${status}`);
    responseG.append("p").html(`Dataset: ${dataset}`);

    // Attributes
    attrG = responseG.append("g").classed("attributes", true);
    attrG.append("span").text("Attributes:");
    attrG
      .append("ol")
      .style("list-style", "decimal")
      .selectAll("li")
      .data(Object.entries(attributeMap))
      .join("li")
      .html((d) => {
        return `${d[0]} &#8592; 
          "${d[1].queryPhrase}", 
          "${d[1].inferenceType}"`;
      });

    // Tasks
    taskG = responseG.append("g").classed("tasks", true);
    taskG.append("span").text("Tasks:");
    taskG
      .append("ol")
      .style("list-style", "decimal")
      .selectAll("li")
      .data(Object.entries(taskMap))
      .join("li")
      .html((d) => {
        let str = "<ul>";
        d[1].forEach((task) => {
          str = `${str}<li>${d[0]} &#8592; 
            "${task.queryPhrase}", 
            "${task.attributes.join(", ")}", 
            "${task.inferenceType}"</li>`;
        });
        return `${str}</ul>`;
      });

    // Visualizations
    visG = responseG.append("g").classed("Visualizations", true);
    visG.append("span").text("Visualizations:");
    visG
      .append("ol")
      .style("list-style", "decimal")
      .selectAll("li")
      .data(visList)
      .join("li")
      .html((d) => {
        return `Score: ${d.score}, 
          Attributes: "${d.attributes.join(", ")}", 
          Tasks: "${d.tasks.join(", ")}"`;
      });
  });
}

$(globalConfig.queryBtn).on("click", function () {
  runNL4DV($(globalConfig.queryInput).val());
});

$(document).ready(() => initializeNL4DV());
