"use client";

import React, { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import { useTheme } from "next-themes";
import useSWR from "swr";
import { api } from "@/lib/api";

interface GraphData { _count: number, technology_id: string, name: string }

export default function Questions() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { data: questionsData, isLoading } = useSWR('/dashboard/get-questions-data', api.get);
  
  const totalCount = useMemo(() => questionsData?.data?.reduce((sum: number, item: GraphData) => sum + item._count, 0) || 0, [questionsData]);
  const graphData = useMemo(() => {
    return questionsData?.data?.map((item: GraphData) => ({
      value: item._count,
      name: item.name,
    })) || [];
  }, [questionsData])

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
              show: true,
              position: "center",
              fontSize: 20,
              fontWeight: "bold",
              color: theme === "light" ? "#333" : "#fff",
              formatter: `{total|${totalCount}}\n{small|Total Questions}`,
              rich: {
                total: { fontSize: 24, fontWeight: "bold", color: "#333" },
                small: { fontSize: 14, color: "#666" },
              },
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 20,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: true,
            },
            data: [graphData],
          },
        ],
      };

      myChart.setOption(option);

      return () => {
        myChart.dispose();
      };
    }
  }, [theme,graphData]);

  return (
    <>
    <div className="p-4 rounded-md shadow-md border">
      <h2 className="font-semibold mb-4 sticky top-0 z-10">Questions Data</h2>
      {/* {!isLoading && graphData.length>0 && <div
        ref={chartRef}
        style={{ width: "100%", height: "400px" }}
        className="rounded-md  mb-4"
      ></div>} */}
      {/* {!isLoading && graphData.length==0 && */}
       <div className="w-full h-[400px] flex items-center justify-center">
        There is no data available
      </div>

      {/* } */}
    </div>
    </>
  );
}

