import { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const WeeklyShipmentsChart = ({ thisWeekData, prevWeekData }) => {
  const [view, setView] = useState("thisWeek");
  const [open, setOpen] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const options = [
    { value: "thisWeek", label: "This Week" },
    { value: "prevWeek", label: "Previous Week" },
  ];

  const handleSelect = (val) => {
    setView(val);
    setOpen(false);
  };

  const chartData =
    view === "thisWeek"
      ? thisWeekData.map((value, index) => ({ label: days[index], value }))
      : prevWeekData.map((value, index) => ({ label: days[index], value }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#3B6255]">
          Weekly Shipments Chart
        </h3>

        {/* Dropdown integrated here */}
        <div className="relative inline-block w-44">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between bg-white font-poppins px-4 py-2 text-sm cursor-pointer"
          >
            <span className="text-[#3B6255] font-semibold">
              {options.find((o) => o.value === view)?.label}
            </span>
            <IoMdArrowDropdown
              className={`w-8 h-8 text-[#3B6255] bg-[#e9eded] p-1 rounded-xl transition-transform ${open ? "rotate-180" : ""
                }`}
            />
          </div>

          {open && (
            <ul className="absolute left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${view === option.value
                    ? "text-[#578C7A] font-medium"
                    : "text-gray-700"
                    }`}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -35, bottom: 0 }}
            style={{ cursor: "pointer" }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#578C7A" stopOpacity={1} />
                <stop offset="95%" stopColor="#578C7A" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#e8e8e8"   
              strokeWidth={1}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#3B6255", fontSize: 12 ,dy: 10 ,dx:0}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#D3D3D3", fontSize: 12,dx:-10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperStyle={{ pointerEvents: "none" }}
              content={({ active, payload, coordinate }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      className="bg-white text-[#578C7A] text-xs font-semibold px-6 py-1 rounded-md broder border-2 border-gray-100 shadow-md"
                      style={{
                        position: "absolute",
                        left: coordinate.x,              // follow activeDot horizontally
                        top: coordinate.y - 50,          // position above activeDot dynamically
                        transform: "translateX(-50%)",   // center align
                        pointerEvents: "none",
                      }}
                    >
                      {payload[0].value}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ stroke: "#fff", strokeWidth: 1, strokeDasharray: "0" }}
            />


            <Area
              type="monotone"
              dataKey="value"
              stroke="#35594B"
              strokeWidth={3}
              fill="url(#colorValue)"
              activeDot={{
                r: 6,
                stroke: "#35594B",
                strokeWidth: 2,
                fill: "#35594B",

              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyShipmentsChart;
