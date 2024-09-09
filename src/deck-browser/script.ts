import { renderChart } from "./renderChart";
import { getChartData } from "../bridge";
const chartData = getChartData();

/* ======================== *\
    #
\* ======================== */

// % Improvement
const improvement = document.querySelector(".reviewed__improve");
if (improvement) {
    const percent = Math.round(chartData.improvement * 100);
    if (percent > 0) {
        improvement.textContent = `+${percent}%`;
        improvement.setAttribute(
            "title",
            `Today you reviewed +${percent}% more than your average. Great Work :)`
        );
    } else if (percent > -30) {
        improvement.textContent = `${percent}%`;
        improvement.setAttribute(
            "title",
            `Today you reviewed ${percent}% less than your average. C'mon we can do more`
        );
    }
}
const reviewed = document.querySelector(".reviewed__num");
if (reviewed)
    reviewed.textContent = `${chartData.todaysTotal.toLocaleString()}`;

// Chart
document
    .querySelector(".chart-placeholder")
    ?.replaceWith(renderChart(chartData));

// Stats
const statLine = document.querySelector(".stat-line");
statLine?.append(
    renderStat("Personal Best: ", chartData.personalBest),
    renderTotalDays(chartData.totalDays),
    renderStat("Total Reviews: ", chartData.totalReviews)
);

/* ======================== *\
    #Render Components
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

    if (totalDays >= 365)
        span.textContent = `${totalDays.toLocaleString()} (${(
            totalDays / 365
        ).toFixed(1)} yrs)`;
    else
        span.textContent = `${totalDays.toLocaleString()} (${(
            totalDays / 30
        ).toFixed(1)} mo)`;

    // Add to parent element
    const li = document.createElement("li");
    li.appendChild(text);
    li.appendChild(span);
    return li;
}
