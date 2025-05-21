import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'

function TestError({accessError,errorTitle}:{accessError:string,errorTitle:string}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="w-[90%] max-w-md p-6">
          <CardHeader>
            <CardTitle className="text-red-600">{errorTitle} Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{accessError}</AlertDescription>
            </Alert>
            <p className="mt-4 text-gray-600">
              If you believe this is an error, please contact your exam administrator or request a
              new exam link.
            </p>
          </CardContent>
        </Card>
      </div>
  )
}

export default TestError
