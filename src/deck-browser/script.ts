import "../bridge";

// addEventListener("DOMContentLoaded", function () {});

// document
//     .querySelectorAll<HTMLAnchorElement>("td.decktd > a.deck")
//     .forEach((ele) => {
//         const oldClick = ele.onclick;
//         if (oldClick) {
//             ele.onclick = function (event) {
//                 oldClick.call(ele, event);
//                 pycmd("study");
//             };
//         }
//     });

/* ======================== *\
    #Render Stats
\* ======================== */

const reviewed = document.querySelector(".reviewed__num");
if (reviewed)
    reviewed.textContent = `${chartData.todaysTotal} ${chartData.displayImprovment}`;

const statLine = document.querySelector(".stat-line");
if (statLine) {
    renderStat(statLine, "Personal Best: ", chartData.personalBest);
    renderStat(statLine, "Total Days: ", chartData.totalDays);
    renderStat(statLine, "Total Reviews: ", chartData.totalReviews);
}

/* ======================== *\
    #Utils
\* ======================== */

function renderStat<T extends Element>(
    elem: T,
    label: string,
    value: number
): T {
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

    // mutate element
    elem.appendChild(li);
    return elem;
}
