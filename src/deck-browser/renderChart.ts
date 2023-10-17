import { create } from "d3-selection";
import { line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { axisLeft } from "d3-axis";
import { extent } from "d3-array";

/* ======================== *\
    #Chart
\* ======================== */

export function renderChart(data: [string, number][]): SVGSVGElement | null {
    const MARGIN = { top: 32, right: 16, bottom: 32, left: 16 };
    const SVG_WIDTH = 600,
        SVG_HEIGHT = 150;

    const svg = create("svg").attr(
        "viewBox",
        `-${MARGIN.left} -${MARGIN.top} ${
            SVG_WIDTH + MARGIN.left + MARGIN.right
        } ${SVG_HEIGHT + MARGIN.top + MARGIN.bottom}`
    );

    // Extents
    // const dateExtent = extent(data, (d) => new Date(d[0])) as [Date, Date];
    const valueExtent = extent(data, (d) => d[1]) as [number, number];

    // Scales
    // const dateScale = scaleTime(dateExtent, [0, SVG_WIDTH]);
    const valScale = scaleLinear(valueExtent, [SVG_HEIGHT, 0]);

    // Formulas
    const xFunc = (_: any, i: number) => i * (SVG_WIDTH / (data.length - 1));
    const yFunc = (d: [string, number]) => valScale(d[1]);
    const lineFunc = line<[string, number]>()
        // .x((d) => dateScale(new Date(d[0])))
        .x(xFunc)
        .y(yFunc);

    // Draw Axis
    svg.append("g").data([data]);

    // Draw line
    svg.selectAll("path")
        .data([data])
        .join("path")
        .classed("line js-line", true)
        .attr("d", lineFunc);

    // Draw Circles
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "point")
        .attr("cx", xFunc)
        .attr("cy", yFunc)
        .attr("r", 6);

    return svg.node();
}
