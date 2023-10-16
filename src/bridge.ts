declare const pycmd: (cmd: string) => void;

declare const chartData: {
    last10: [string, number][]; // <"2023-07-3", 143>
    // fullHistory: Map<string, number>; // <"2023-07-3", 143>
    todaysTotal: number;
    displayImprovment: string;
    personalWorst: number;
    personalBest: number;
    totalDays: number;
    totalReviews: number;
};
