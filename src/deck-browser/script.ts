import "../bridge";
import { selectAll, select, create } from "d3-selection";
import { line } from "d3-shape";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";

/* ======================== *\
    #Render Stats
\* ======================== */

const reviewed = document.querySelector(".reviewed__num");
if (reviewed)
    reviewed.textContent = `${chartData.todaysTotal} ${chartData.displayImprovment}`;

const statLine = document.querySelector(".stat-line");
if (statLine) {
    statLine.append(
        renderStat("Personal Best: ", chartData.personalBest),
        renderStat("Total Days: ", chartData.totalDays),
        renderStat("Total Reviews: ", chartData.totalReviews)
    );
}

const chartContainer = document.querySelector(".chart");
if (chartContainer) {
    const svg = renderChart(chartData.last10);
    if (svg) chartContainer.appendChild(svg);
}

/* ======================== *\
    #Chart
\* ======================== */

function renderChart(data: [string, number][]): SVGSVGElement | null {
    const SVG_WIDTH = 600,
        SVG_HEIGHT = 150;

    const svg = create("svg")
        .attr("viewBox", `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

    // Extents
    const dateExtent = extent(data, (d) => new Date(d[0])) as [Date, Date];
    const valueExtent = extent(data, (d) => d[1]) as [number, number];

    // Scales
    const dateScale = scaleTime().domain(dateExtent).range([0, SVG_WIDTH]);
    const valScale = scaleLinear().domain(valueExtent).range([SVG_HEIGHT, 0]);
    const lineFunc = line<[string, number]>()
        .x((d) => dateScale(new Date(d[0])))
        .y((d) => valScale(d[1]));

    svg.selectAll("path")
        .data([data])
        .join("path")
        .classed("line js-line", true)
        .attr("d", lineFunc);

    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "point")
        .attr("cx", (d) => dateScale(new Date(d[0])))
        .attr("cy", (d) => valScale(d[1]))
        .attr("r", 6);

    return svg.node();
}

/* ======================== *\
    #Utils
\* ======================== */

function renderStat(label: string, value: number): HTMLLIElement {
    // label
    const text = document.createTextNode(label);

    // value
    const span = document.createElement("span");
    span.classList.add("highlight");
    span.textContent = value.toString();

    // Add to parent element
    const li = document.createElement("li");
    li.appendChild(text);
    li.appendChild(span);
    return li;
}
