import pathlib
import json

from datetime import datetime
from functools import reduce
from math import floor

from aqt import gui_hooks, mw
from aqt.deckbrowser import DeckBrowser, DeckBrowserContent
from aqt.overview import Overview, OverviewContent


# Edit UI Elements
#########################################################################


def momentumStats() -> str:

    # Pull Review data from the DB
    NUM_OF_DAYS = 10  # 100
    nextDayOffset = datetime.fromtimestamp(mw.col.crt).hour * 3600
    # statList = mw.col.db.all(
    #     f"SELECT DATE(id / 1000 - {nextDayOffset}, 'unixepoch', 'localtime') AS day, COUNT() FROM revlog GROUP BY day ORDER BY day DESC LIMIT {NUM_OF_DAYS}"
    # )
    statList = mw.col.db.all(
        f"SELECT DATE(id / 1000 - {nextDayOffset}, 'unixepoch', 'localtime') AS day, COUNT() FROM revlog GROUP BY day ORDER BY day DESC"
    )

    # Convert data form Array --> Dictionary
    # Data Example: (2023-07-32, 143)
    dataSet = {}
    for date, count in statList:
        dataSet[date] = count
    # reviewList = map(lambda item: item[1], statList)

    # Calculate Stats
    totalReviews = reduce(lambda acc, item: acc + item[1], statList, 0)
    totalDays = len(statList)
    avg = floor(totalReviews / NUM_OF_DAYS)
    personalWorst = min(map(lambda item: item[1], statList))
    personalBest = max(map(lambda item: item[1], statList))

    # Today's Stats
    todayString = datetime.now().strftime("%Y-%m-%d")
    todaysTotal = dataSet[todayString] if todayString in dataSet else 0
    improvement = round((todaysTotal / avg - 1) * 100)

    # Render the Data to HTML
    displayImprovment = f"({improvement}%)" if improvement > 0 else f""

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
            "last10": statList[:NUM_OF_DAYS],
            "todaysTotal": todaysTotal,
            "displayImprovment": displayImprovment,
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
