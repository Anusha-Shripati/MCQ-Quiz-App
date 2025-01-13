"use client";
import React from "react";
import ReactECharts from "echarts-for-react";
import { useTheme } from "next-themes";
interface Props {
  monthdata: string[];
}
const InterviewStatics: React.FC<Props> = ({ monthdata }) => {

  const { theme } = useTheme();

  // Chart configuration
  const options = {
    title: {
      text: "Exam Results Statistics",
      left: "45px",
      top: "20px",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme === "light" ? "#333" : "#fff",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(50, 50, 50, 0.7)",
      borderColor: "#ccc",
      borderWidth: 1,
      textStyle: {
        color: theme === "light" ? "#fff" : "#000",
      },
    },
    legend: {
      data: ["Passed", "Failed"],
      bottom: "5%",
      textStyle: {
        fontSize: 14,
        color: theme === "light" ? "#666" : "#fff",
      },
    },
    grid: {
      top: "15%",
      bottom: "15%",
      left: "10%",
      right: "10%",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthdata,
      axisLine: {
        lineStyle: {
          color: theme === "light" ? "#888" : "#fff",
        },
      },
      axisLabel: {
        fontSize: 12,
        color: theme === "light" ? "#555" : "#fff",
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
      },
      axisLabel: {
        fontSize: 12,
        color: theme === "light" ? "#555" : "#fff",
      },
      splitLine: {
        lineStyle: {
          color: theme === "light" ? "#eee" : "#333",
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Passed",
        type: "line",
        data: [120, 180, 160, 200, 190, 230, 280],
        smooth: true,
        lineStyle: {
          color: theme === "light" ? "#adebbc" : "#00e676", // Bright green for "Passed"
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: theme === "light" ? "rgba(40, 167, 69, 0.5)" : "rgba(0, 230, 118, 0.5)" }, // Green gradient
              { offset: 1, color: theme === "light" ? "rgba(40, 167, 69, 0)" : "rgba(0, 230, 118, 0)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: theme === "light" ? "#adebbc" : "#00e676",
          borderColor: "#fff",
          borderWidth: 2,
        },
      },
      {
        name: "Failed",
        type: "line",
        data: [30, 50, 60, 40, 70, 80, 100],
        smooth: true,
        lineStyle: {
          color: theme === "light" ? "#f0a8af" : "#ff5252", // Bright red for "Failed"
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: theme === "light" ? "rgba(220, 53, 69, 0.5)" : "rgba(255, 82, 82, 0.5)" }, // Red gradient
              { offset: 1, color: theme === "light" ? "rgba(220, 53, 69, 0)" : "rgba(255, 82, 82, 0)" },
            ],
          },
        },
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: theme === "light" ? "#f0a8af" : "#ff5252",
          borderColor: "#fff",
          borderWidth: 2,
        },
      },
    ],
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <ReactECharts
        option={options}
        style={{ height: "450px", width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default InterviewStatics;

