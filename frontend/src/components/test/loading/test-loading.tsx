import React from 'react'
import { Card, CardContent } from '../../ui/card'

function TestLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
    <Card className="w-[90%] max-w-md p-6 bg-transparent shadow-none border-0">
      <CardContent className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </CardContent>
    </Card>
  </div>
  )
}

export default TestLoading

  