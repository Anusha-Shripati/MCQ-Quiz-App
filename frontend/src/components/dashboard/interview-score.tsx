'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import LanguageScoreSelect from './filter'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Progress } from '../ui/progress'
import { api } from '@/lib/api'
import useSWR from 'swr'
import {  scores } from '@/shared/constants/data'

interface ScoreData{
    date: string
    name: string
    score: string
}

function InterviewScore() {


    
    const [scoreData, setScoreData] = React.useState<ScoreData[]>([])
    const [filters, setFilters] = React.useState({language:"",score:""})
    const { data } = useSWR(`/dashboard/get-interview-score?language=${filters.language}&score=${filters.score}`, api.get)

    useEffect(()=>{
        if(data){
            setScoreData(data.data)
        }
    },[data])
    const hanldeSetFilter=(name:string,value:string)=>{
        setFilters((prev)=>{
            return {
                ...prev,
                [name]:value
            }
        })
    }

    return (
        <Card className="col-span-12 md:col-span-6 row-span-2">
            <CardHeader>
                <div className="flex items-center justify-between space-x-3">
                    <div className="space-y-1">
                        <CardTitle>
                            Interview Scores
                        </CardTitle>
                        <CardDescription className="text-xs text-gray-600">
                            Performance of candidates.
                        </CardDescription>
                    </div>

                    <LanguageScoreSelect setFilters={hanldeSetFilter} scores={scores}  filters={filters}/>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-200 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scoreData.map((score, index) => (
                                <tr
                                    key={index}
                                    className="border-b hover:bg-gray-50 hover:text-gray-700 transition"
                                >
                                    <td className="px-4 py-2">{score.date}</td>
                                    <td className="px-4 py-2 flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <span>{score.name}</span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center space-x-2">
                                            <Progress
                                                value={parseInt(score.score)}
                                                className="w-32 "
                                            />
                                            <span>{score.score}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

export default InterviewScore
