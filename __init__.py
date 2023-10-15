import pathlib
import json

from datetime import datetime
from functools import reduce
from math import floor

from aqt import mw
from aqt.utils import showInfo

from anki.hooks import wrap
from aqt import gui_hooks
from aqt.deckbrowser import DeckBrowser


# Edit UI Elements
#########################################################################


def deckBrowserNoncontinuousStats(self, _old):
    # orginalHTML = _old(self)

    # Pull Review data from the DB
    NUM_OF_DAYS = 14  # 100
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
        .joinpath(__name__)  # \BetterMetrics
        .joinpath("dist/src/deck-browser/index.html")
        .resolve()
    )
    content = path.read_text()

    # Prepare stats in a a JSON format, to be sent to the frontend
    chartdata = json.dumps(
        {
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


def hideDeckBrowserContent(deck_browser, content) -> None:
    # showInfo(content.tree.replace("<", " "))
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
            span.review-count { background-color: #16a34a; }
            span.learn-count { background-color: #f87171; }
            span.new-count { background-color: #1d4ed8; }
            span.zero-count { background-color: #545454; opacity: 0.25; }
        </style>
        """


def hideOverviewStats(overview, content) -> None:
    # showInfo(content.table.replace("<", " "))
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


# Connect Hooks
#########################################################################

gui_hooks.overview_will_render_content.append(hideOverviewStats)
gui_hooks.deck_browser_will_render_content.append(hideDeckBrowserContent)
DeckBrowser._renderStats = wrap(
    DeckBrowser._renderStats, deckBrowserNoncontinuousStats, "around"
)

# Helper Functions
#########################################################################


def renderChart():
    # fullHistory = ""
    # for date, count in statList:
    #     fullHistory += f"<div>{date}......{count}</div>"
    reduce(lambda acc, item: acc + f"<div>{item[0]}......{item[1]}</div>", statList, "")
