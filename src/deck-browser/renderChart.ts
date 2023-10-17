import { select, create, line, scaleLinear, axisLeft, extent } from "d3";

/* ======================== *\
    #Chart
\* ======================== */

export function renderChart(data: [string, number][]): SVGSVGElement | null {
    const MARGIN = { top: 32, right: 16, bottom: 32, left: 32 };
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
    const lineFunc = line<[string, number]>(xFunc, yFunc);

    // Draw Axis
    svg.append("g").call(axisLeft(valScale).ticks(4));
    svg.selectAll(".tick line")
        .attr("opacity", "0.5")
        .attr("stroke-dasharray", "2,2")
        .attr("x2", SVG_WIDTH);
    svg.selectAll(".domain").remove();

    // Draw line
    svg.append("g")
        .selectAll("path")
        .data([data])
        .join("path")
        .classed("line js-line", true)
        .attr("d", lineFunc);

    // Draw Circles
    const CIRCLE_RADIUS = 6;
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "point")
        .style("transform-origin", (d, i) => `${xFunc(d, i)}px ${yFunc(d)}px`)
        .attr("cx", xFunc)
        .attr("cy", yFunc)
        .attr("r", CIRCLE_RADIUS)
        .on("mouseover", (e) =>
            select(e.target).style("cursor", "pointer").style("scale", "1.3")
        )
        .on("mouseout", (e) => select(e.target).style("scale", "1"));

    return svg.node();
}
