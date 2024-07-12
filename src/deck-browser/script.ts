import { renderChart } from "./renderChart";
import { getChartData } from "../bridge";
const chartData = getChartData();

/* ======================== *\
    #Render Stats
\* ======================== */

const reviewed = document.querySelector(".reviewed__num");
if (reviewed)
    reviewed.textContent = `${chartData.todaysTotal.toLocaleString()}`;

const statLine = document.querySelector(".stat-line");
statLine?.append(
    renderStat("Personal Best: ", chartData.personalBest),
    renderTotalDays(chartData.totalDays),
    renderStat("Total Reviews: ", chartData.totalReviews)
);

const newChart = renderChart(chartData.recentData);
if (newChart)
    document.querySelector(".chart-placeholder")?.replaceWith(newChart);

/* ======================== *\
    #Utils
\* ======================== */

function renderStat(label: string, value: number): HTMLLIElement {
    // label
    const text = document.createTextNode(label);

    // value
    const span = document.createElement("span");
    span.classList.add("highlight");
    span.textContent = value.toLocaleString();

    // Add to parent element
    const li = document.createElement("li");
    li.appendChild(text);
    li.appendChild(span);
    return li;
}

function renderTotalDays(totalDays: number): HTMLLIElement {
    // label
    const text = document.createTextNode("Total Days: ");

    // value
    const span = document.createElement("span");
    span.classList.add("highlight");
    span.textContent = `${totalDays.toLocaleString()} (${(
        totalDays / 365
    ).toFixed(1)}) yrs`;

    // Add to parent element
    const li = document.createElement("li");
    li.appendChild(text);
    li.appendChild(span);
    return li;
}
