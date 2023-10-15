declare const pycmd: (cmd: string) => void;
declare const chartData: Record<string, number>;

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

const statLine = document.querySelector(".stats-line");
const thing = document.querySelector(".temp");
