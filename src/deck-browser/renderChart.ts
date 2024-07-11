import {
    select,
    create,
    line,
    area,
    scaleLinear,
    axisLeft,
    extent,
    mean,
} from "d3";

/* ======================== *\
    #Chart
\* ======================== */

export function renderChart(data: [string, number][]): SVGSVGElement | null {
    const MARGIN = { top: 12, right: 12, bottom: 12, left: 36 };
    const SVG_WIDTH = 600,
        SVG_HEIGHT = 150;

    const svg = select<SVGSVGElement, unknown>(".chart > svg").attr(
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
    const xFunc = (_d: any, i: number) => i * (SVG_WIDTH / (data.length - 1));
    const yFunc = ([_date, reviews]: [string, number]) => valScale(reviews);

    // Draw Axis
    // svg.append("g").call(axisLeft(valScale).ticks(3));
    // svg.selectAll(".tick line")
    //     .attr("opacity", "0.2")
    //     .attr("stroke-dasharray", "9,3")
    //     .attr("x2", SVG_WIDTH);
    // svg.selectAll(".domain").remove();

    // Draw Area under the graph
    const underArea = area<[string, number]>()
        .x(xFunc)
        .y0(SVG_HEIGHT)
        .y1((d) => yFunc(d));
    svg.append("path").classed("under-area", true).attr("d", underArea(data));

    // Draw Average line
    const avg = mean(data, (d) => d[1]);
    const averageY = valScale(avg ?? 0);
    svg.append("line")
        .classed("avg-line", true)
        .attr("stroke-dasharray", "9,3")
        .attr("x2", SVG_WIDTH)
        .attr("y1", averageY)
        .attr("y2", averageY);
    svg.append("text")
        .text("AVG")
        .classed("avg-text", true)
        .attr("dominant-baseline", "middle")
        .attr("x", -4)
        .attr("y", averageY);

    // Draw line
    const lineFunc = line<[string, number]>(xFunc, yFunc);
    svg.append("g")
        .selectAll("path")
        .data([data])
        .join("path") // Enter + Update
        .classed("line js-line", true)
        .attr("d", lineFunc);

    // Draw Circles
    const CIRCLE_RADIUS = 8;
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle") // Enter + Update
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
