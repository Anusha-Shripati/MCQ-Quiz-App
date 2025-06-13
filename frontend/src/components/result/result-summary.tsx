import { api } from "@/lib/api";
import { technologyEndpoint } from "@/lib/endpoint";
import { Layers } from "lucide-react";
import React, { useEffect } from "react";
import useSWR from "swr";

interface ResultSummaryProps {
    score: number
    total: number
    percentage: number
    technologies: { technology_id: string; score: number; total: number; percentage: number }[]
    passCriteria: number
    is_passed: boolean
}

const ResultSummary: React.FC<ResultSummaryProps> = ({ score, total, percentage, technologies, passCriteria, is_passed }) => {
    const { data: technology, isLoading } = useSWR(technologyEndpoint.LIST, api.get, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
        staleWhileRevalidate: true,
    });
    const [techListWithScores, setTechListWithScores] = React.useState<{ technology_id: string; score: number; total: number; percentage: number; name: string }[]>([]);
    useEffect(() => {
        if (technology) {
            const score = technologies.map((tech) => {
                const techData = technology.data.list.find((t: { id: string, name: string }) => t.id === tech.technology_id);
                return {
                    ...techData,
                    score: tech.score,
                    total: tech.total,
                    percentage: tech.percentage,
                };
            });
            setTechListWithScores(score);
        }
    }, [technology, technologies]);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-0 mb-10 text-gray-900 dark:text-gray-100 shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Score Summary Card */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-8 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full p-4">
                        <Layers />
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Your Score</div>
                        <div className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">
                            {score.toFixed(1)} <span className="text-xl text-gray-400 dark:text-gray-500">/ {total}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-start gap-1 w-full md:w-auto min-w-[300px]">
                    <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Percentage</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{percentage.toFixed(2)}%</span>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div
                            className={`h-2 rounded-full ${percentage >= passCriteria ? "bg-green-500 dark:bg-green-400" : "bg-red-500 dark:bg-red-400"}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-start gap-1 w-full md:w-auto min-w-[200px]">
                    <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">Passing Criteria</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">{passCriteria.toFixed(2)}%</span>
                </div>
                <div>
                    <span className={`px-5 py-2 rounded-full font-bold text-lg shadow-sm ${is_passed
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}>
                        {is_passed ? "Passed" : "Failed"}
                    </span>
                </div>
            </div>
            {/* Technology Table */}
            <div className="p-6 md:p-10">
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z" /></svg>
                    Technology Breakdown
                </h4>
                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400 dark:border-blue-600"></span>
                        </div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    <th className="px-6 py-3 font-semibold">Technology</th>
                                    <th className="px-6 py-3 font-semibold">Score</th>
                                    <th className="px-6 py-3 font-semibold">Total</th>
                                    <th className="px-6 py-3 font-semibold">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {techListWithScores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500">No data available</td>
                                    </tr>
                                ) : (
                                    techListWithScores.map((tech, index) => (
                                        <tr key={index} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200">
                                            <td className="px-6 py-3 font-semibold">{tech?.name || "Unknown"}</td>
                                            <td className="px-6 py-3">{tech.score}</td>
                                            <td className="px-6 py-3">{tech.total}</td>
                                            <td className="px-6 py-3">{tech.percentage?.toFixed(2)}%</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ResultSummary;