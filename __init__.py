import pathlib
import json

from datetime import datetime, timedelta
from functools import reduce
from math import floor

from aqt import gui_hooks, mw
from aqt.deckbrowser import DeckBrowser, DeckBrowserContent
from aqt.overview import Overview, OverviewContent


# Edit UI Elements
#########################################################################


def momentumStats() -> str:
    # By default each day starts at 4am (Configured in the user's anki settings)
    HOURS_TO_SECONDS = 3600
    nextDayOffset = datetime.fromtimestamp(mw.col.crt).hour  # 4hrs by default
    #  Example: '2024-07-11'
    todayString = (datetime.now() - timedelta(hours=nextDayOffset)).strftime("%Y-%m-%d")

    # Count how many cards have been reviewed each day
    #   "id" in the table stores epoch time in milliseconds
    #   Most recent days are first in the array
    statList: list[tuple[str, int]] = mw.col.db.all(
        f"SELECT DATE(id / 1000 - {nextDayOffset * HOURS_TO_SECONDS}, 'unixepoch', 'localtime') AS day, COUNT() FROM revlog GROUP BY day ORDER BY day DESC"
    )
    # Example: { "2023-07-32": 143, "2024-07-11": 43}
    dataSet = dict(statList)

    # All Time Stats
    totalReviews = reduce(lambda acc, item: acc + item[1], statList, 0)
    totalDays = len(statList)
    personalWorst = min(map(lambda item: item[1], statList))
    personalBest = max(map(lambda item: item[1], statList))

    # Recent Stats
    NUM_OF_DAYS = 10
    recentData = (
        statList[:NUM_OF_DAYS]
        if todayString in dataSet
        else [(todayString, 0)] + statList[: NUM_OF_DAYS - 1]
    )
    recentData.reverse()
    recentTotalReviews = reduce(lambda acc, item: acc + item[1], recentData, 0)
    recentAvg = floor(recentTotalReviews / NUM_OF_DAYS)
    recentWorst = min([num for _, num in recentData])
    recentBest = max([num for _, num in recentData])

    # Today's Stats
    todaysTotal = dataSet[todayString] if todayString in dataSet else 0
    improvement = todaysTotal / recentAvg - 1

    # Get the HTML
    path = (
        # C:\...\AppData\Roaming\Anki2\addons21
        pathlib.Path(mw.pm.addonFolder())
        .joinpath(__name__)
        .joinpath("dist/src/deck-browser/index.html")
        .resolve()
    )
    content = path.read_text()

    # Prepare stats in a a JSON format, to be sent to the frontend
    chartdata = json.dumps(
        {
            "recentData": recentData,
            "todaysTotal": todaysTotal,
            "improvement": improvement,
            "personalWorst": personalWorst,
            "personalBest": personalBest,
            "totalDays": totalDays,
            "totalReviews": totalReviews,
        },
    )

    return (
        f"""
		<script type="text/javascript"> 
            const chartData = {chartdata};
		</script>
        """
        + f"{content}"
    )


def hideReviewNumbers(deck_browser: DeckBrowser, content: DeckBrowserContent) -> None:
    content.stats = f"{momentumStats()}{content.stats}"
    content.tree += """
		<script type="module"> 
            document.querySelectorAll("td.decktd > a.deck").forEach(ele => {
                const oldClick = ele.onclick;
                ele.onclick = function () {
                    oldClick();
                    setTimeout(() => pycmd("study"), 0);
                }
            })
		</script>
        <style> 
            tr:first-child > th.count { text-align: center; }
            .new-count, .learn-count, .review-count, .zero-count {
                display: block; 
                color: transparent; 
                max-width: 12px; 
                max-height: 12px; 
                border-radius: 50%;

                position: relative;
                left: 50%;
                translate: -50%;
            }
            span.review-count { background-color: var(--state-review); }
            span.learn-count { background-color: var(--state-learn); }
            span.new-count { background-color: var(--state-new); }
            span.zero-count { background-color: var(--fg-faint); }
        </style>
        """


gui_hooks.deck_browser_will_render_content.append(hideReviewNumbers)


def hideOverviewNumbers(overview: Overview, content: OverviewContent) -> None:
    content.table += """
		<script type="module"> 
            const button = document.querySelector("button#study");
            if(button) document.querySelector("table").replaceWith(button);
		</script>
        <style> 
            button#study { margin: 1rem 0; } 
            .new-count, .learn-count, .review-count, .zero-count { visibility: hidden }
        </style>
		"""


gui_hooks.overview_will_render_content.append(hideOverviewNumbers)
