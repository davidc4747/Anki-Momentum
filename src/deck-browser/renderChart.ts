import { select, line, area, scaleLinear, extent, mean } from "d3";
import { ChartData } from "../bridge";

/* ======================== *\
    #Chart
\* ======================== */

export function renderChart(chartData: ChartData): HTMLElement {
    const { recentBest, personalBest, todaysTotal, recentData } = chartData;

    // Containing Div
    const chartElem = document.createElement("div");
    chartElem.classList.add("chart");

    // High Score!
    if (todaysTotal > recentBest) {
        const highScore = document.createElement("div");
        highScore.classList.add("high-score");
        highScore.textContent =
            todaysTotal > personalBest ? `PERSONAL BEST!!!` : `HIGH SCORE!`;
        chartElem.appendChild(highScore);
    }

    // Svg
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    drawLineGraph(svg, recentData);
    if (svg) chartElem.appendChild(svg);

    // all done
    return chartElem;
}

function drawLineGraph(svgElem: SVGSVGElement, data: [string, number][]): void {
    const MARGIN = { top: 12, right: 12, bottom: 12, left: 36 };
    const SVG_WIDTH = 600,
        SVG_HEIGHT = 150;

    const svg = select(svgElem).attr(
        "viewBox",
        `-${MARGIN.left} -${MARGIN.top} ${
            SVG_WIDTH + MARGIN.left + MARGIN.right
        } ${SVG_HEIGHT + MARGIN.top + MARGIN.bottom}`
    ).html(`<defs>
                <linearGradient id="AreaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop class="stop1" offset="0%" />
                    <stop class="stop1" offset="30%" />
                    <stop class="stop2" offset="100%" />
                </linearGradient>
            </defs>`);

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

    // Draw line graph
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
        .selectAll<SVGCircleElement, [string, number]>("circle")
        .data(data)
        .join("circle") // Enter + Update
        .attr("class", "point")
        .style("transform-origin", (d, i) => `${xFunc(d, i)}px ${yFunc(d)}px`)
        .attr("cx", xFunc)
        .attr("cy", yFunc)
        .attr("r", CIRCLE_RADIUS)
        .on("mouseenter", function (e, [date, reviews]): void {
            select(e.target).style("cursor", "pointer").style("scale", "1.3");
            tooltip.style("opacity", 1);

            // Set Text values
            tooltipDate.text(new Date(`${date}T00:00:00`).toLocaleDateString());
            tooltipReviews.text(reviews);

            /* -------------------------------- *\
                #Position Tooltip Background
            \* -------------------------------- */

            // Measure the size of the text elements
            const PADDING = 8;
            const textArea = tooltipText.node()?.getBBox();
            const backgroundBox = {
                x: textArea ? textArea.x - PADDING : 0,
                y: textArea ? textArea.y - PADDING : 0,
                width: textArea ? textArea.width + PADDING * 2 : 0,
                height: textArea ? textArea.height + PADDING * 2 : 0,
            };

            // Adjust based on text size
            tooltipBackground
                .attr("x", backgroundBox.x)
                .attr("y", backgroundBox.y)
                .attr("width", backgroundBox.width)
                .attr("height", backgroundBox.height);

            /* ------------------------ *\
                #Position ToolTip
            \* ------------------------ */

            // const [cx, cy] = pointer(e);
            const [cx, cy] = [this.cx.baseVal.value, this.cy.baseVal.value];

            let toolTipX = 0;
            const halfWidth = backgroundBox.width / 2;
            if (cx + halfWidth >= SVG_WIDTH) {
                toolTipX = SVG_WIDTH - halfWidth;
            } else if (cx - halfWidth < 0) {
                toolTipX = halfWidth;
            } else {
                toolTipX = cx;
            }

            let toolTipY = 0;
            const halfheight = backgroundBox.height / 2;
            if (cy < SVG_HEIGHT / 2) {
                toolTipY = cy + halfheight + CIRCLE_RADIUS * 2;
            } else {
                toolTipY = cy - halfheight - CIRCLE_RADIUS;
            }
            tooltip.style("translate", `${toolTipX}px ${toolTipY}px`);
        })
        .on("mouseout", function (e): void {
            select(e.target).style("scale", "1");
            tooltip.style("opacity", 0);
        });

    // Initialize Tooltip
    const REVIEWS_SIZE = 18;
    const tooltip = svg.append("g").classed("tooltip", true);
    const tooltipText = tooltip.append("g").classed("tooltip__text", true);
    const tooltipReviews = tooltipText
        .append("text")
        .classed("tooltip__reviews", true)
        .attr("font-size", REVIEWS_SIZE);
    const tooltipDate = tooltipText
        .append("text")
        .classed("tooltip__date", true)
        .attr("y", REVIEWS_SIZE);
    const tooltipBackground = tooltip
        .insert("rect", () => tooltipText.node())
        .classed("tooltip__bg", true)
        .attr("rx", 4);
}
