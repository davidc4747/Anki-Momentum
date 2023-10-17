declare const pycmd: (cmd: string) => void;

declare const chartData: ChartData;

type ChartData = {
    last10: [string, number][]; // <"2023-07-3", 143>
    // fullHistory: Map<string, number>; // <"2023-07-3", 143>
    todaysTotal: number;
    displayImprovment: string;
    personalWorst: number;
    personalBest: number;
    totalDays: number;
    totalReviews: number;
};

export function testData(): ChartData {
    return {
        last10: [
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
        displayImprovment: "",
        personalWorst: 1,
        personalBest: 356,
        totalDays: 552,
        totalReviews: 38144,
    } as ChartData;
}
