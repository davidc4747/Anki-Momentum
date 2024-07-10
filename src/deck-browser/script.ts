import { renderChart } from "./renderChart";
import { getChartData } from "../bridge";
const chartData = getChartData();

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
