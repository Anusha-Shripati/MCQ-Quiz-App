"use client";

import { technologies } from "@/shared/constants/data";
import { useState } from "react";

export default function AssessmentDetails() {
  const [openPanels, setOpenPanels] = useState<Record<number, boolean>>({});

  const togglePanel = (panel: number) => {
    setOpenPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  return (
    <div className="p-6 space-y-4">
      {technologies.map((tech, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <div
            className="flex justify-between items-center  p-4 cursor-pointer bg-card hover:bg-gray-50 hover:text-gray-900"
            onClick={() => togglePanel(index)}
          >
            <h2 className="text-lg font-bold">{tech.title}</h2>
            <span>{openPanels[index] ? "▲" : "▼"}</span>
          </div>
          {openPanels[index] && (
            <div className="font-bold bg-card p-4">
              <table className="w-full table-auto text-left">
                <thead className="bg-gray-100 ">
                  <tr>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Technology
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Easy
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Medium
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Hard
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Questions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tech.data.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 hover:text-gray-900"
                    >
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.easy}</td>
                      <td className="p-3">{item.medium}</td>
                      <td className="p-3">{item.hard}</td>
                      <td className="p-3 text-center">{item.questions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-6">
                <div className="bg-gray-100 p-3 rounded text-gray-700 shadow-sm">
                  Total Questions:{" "}
                  <span className="font-bold">{tech.totalQuestions}</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
