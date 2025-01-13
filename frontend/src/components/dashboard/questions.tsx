"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { questionsData } from "../../shared/constants/data";
import { useTheme } from "next-themes";

export default function Questions() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);

      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "center",
          left: "left",
          orient: "vertical",
          textStyle: {
            fontSize: 16,
            color: theme === "light" ? "#333" : "#fff",
          },
        },

        series: [
          {
            name: "Questions count",
            type: "pie",
            radius: ["50%", "80%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: questionsData,
          },
        ],
      };

      myChart.setOption(option);

      return () => {
        myChart.dispose();
      };
    }
  }, [theme]);

  return (
    <div className="p-4 rounded-md shadow-md border">
      <h2 className="font-semibold mb-4 sticky top-0 z-10">Questions Data</h2>

      <div
        ref={chartRef}
        style={{ width: "100%", height: "400px" }}
        className="rounded-md  mb-4"
      ></div>
    </div>
  );
}

