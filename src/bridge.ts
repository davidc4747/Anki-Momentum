declare const pycmd: (cmd: string) => void;
declare const chartData: ChartData;

export type ChartData = {
    // fullHistory: Map<string, number>; // <"2023-07-3", 143>
    recentData: [string, number][]; // <"2023-07-3", 143>
    recentBest: number;

    todaysTotal: number;
    improvement: number;

    personalWorst: number;
    personalBest: number;
    totalDays: number;
    totalReviews: number;
};

export function testData(): ChartData {
    return {
        recentData: [
            ["2023-10-08", 18],
            ["2023-10-07", 78],
            ["2023-09-30", 18],
            ["2023-09-24", 99],
            ["2023-09-23", 261],
            ["2023-09-22", 21],
            ["2023-09-16", 25],
            ["2023-09-15", 105],
            ["2023-09-10", 356],
            ["2023-09-03", 77],
        ],
        todaysTotal: 0,
        improvement: 0.02,
        personalWorst: 1,
        personalBest: 356,
        totalDays: 552,
        totalReviews: 38144,
    } as ChartData;
}

export function getChartData(): ChartData {
    return chartData;
}
