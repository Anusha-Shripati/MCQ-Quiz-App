'use client'

import React, { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import LanguageScoreSelect from './filter'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Progress } from '../ui/progress'
import { api } from '@/lib/api'
import useSWR from 'swr'
import { scores } from '@/shared/constants/data'
import ReusableTable from '../common/reusable-table'

interface ScoreData {
    date: string
    name: string
    score: string
}

function InterviewScore() {



    const [scoreData, setScoreData] = React.useState<ScoreData[]>([])
    const [filters, setFilters] = React.useState({ language: "", score: "" })
    const { data } = useSWR(`/dashboard/get-interview-score?language=${filters.language}&score=${filters.score}`, api.get)

    useEffect(() => {
        if (data) {
            setScoreData(data.data)
        }
    }, [data])
    const hanldeSetFilter = (name: string, value: string) => {
        setFilters((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }
    const columns = [
        { key: 'date', header: "Date", render: (row: ScoreData) => row.date },
        {
            key: 'name', header: "Name", render: (row: ScoreData) => <div className='flex items-center space-x-2'>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>{row.name}</AvatarFallback>
                </Avatar>
                <span>{row.name}</span>
            </div>
        },
        {
            key: 'score', header: "Score", render: (row: ScoreData) => <div className="flex items-center space-x-2">
                <Progress
                    value={parseInt(row.score)}
                    className="w-32 "
                />
                <span>{row.score}</span>
            </div>
        },
    ]
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

                    <LanguageScoreSelect setFilters={hanldeSetFilter} scores={scores} filters={filters} />
                </div>
            </CardHeader>
            <CardContent>
                <ReusableTable
                    columns={columns}
                    rows={scoreData}
                    rowKey='name'
                />
            </CardContent>
        </Card>
    )
}

export default InterviewScore
