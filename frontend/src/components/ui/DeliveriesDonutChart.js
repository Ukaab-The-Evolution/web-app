import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = ["#3B6255", "#e8c30a", "#d44e3f"]; // green, yellow, red

const DeliveriesDonutChart = ({ data }) => {
    const total = data.ontime + data.inProgress + data.delayed;

    const chartData = {
        labels: ["Ontime", "In Progress", "Delayed"],
        datasets: [
            {
                data: [data.ontime, data.inProgress, data.delayed],
                backgroundColor: COLORS,
                borderWidth: 0,
            },
        ],
    };

    const options = {
        cutout: "80%", // controls donut thickness
        responsive: true,
        plugins: {
            legend: {
                display: false, // hide default legend
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const percent = ((value / total) * 100).toFixed(0);
                        return `${context.label}: ${value} (${percent}%)`;
                    },
                },
            },
        },
    };

    const overallPercentage = ((data.ontime / total) * 100).toFixed(0);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-[#3B6255] mb-8">Deliveries</h3>

            <div className="flex items-center justify-between mb-8">
                {/* Donut Chart */}
                <div className="relative w-48 h-48">
                    <Doughnut data={chartData} options={options} />

                    {/* Percentage in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-[#3B6255]">
                            {overallPercentage}%
                        </span>
                    </div>
                </div>

                {/* Custom Labels on Right */}
                <div className="space-y-4 ml-8">
                    {chartData.labels.map((label, index) => {
                        const value = chartData.datasets[0].data[index];
                        return (
                            <div
                                key={label}
                                className="flex items-center justify-between text-base min-w-[140px]"
                            >
                                <div className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-3"
                                        style={{ backgroundColor: COLORS[index] }}
                                    />
                                    <span className="font-medium"
                                        style={{ color: COLORS[index] }}
                                    >{label}</span>
                                </div>
                                <span className="font-semibold ml-4"  style={{ color: COLORS[index] }} >
                                    {((value / total) * 100).toFixed(0)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button className="w-full  bg-gradient-to-t from-[#3B6255] to-[#578C7A] 
             shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-poppins text-[18px] leading-[100%] mt-16 bg-[#578C7A] cursor-pointer transition-all duration-300 ease-in 
             hover:from-[#2F4F43] hover:to-[#4A7D6D] flex items-center justify-center gap-3 text-white py-3 rounded-xl hover:bg-[#4a7a69] ">
                Download Statistics
            </button>
        </div>
    );
};

export default DeliveriesDonutChart;
