document
    .querySelectorAll<HTMLAnchorElement>("td.decktd > a.deck")
    .forEach((ele) => {
        const oldClick = ele.onclick;
        if (oldClick) {
            ele.onclick = function (event) {
                oldClick.call(ele, event);
                pycmd("study");
            };
        }
    });
