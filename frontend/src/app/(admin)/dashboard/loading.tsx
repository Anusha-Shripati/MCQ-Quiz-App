import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b grid grid-cols-12 gap-5">
      {/* Top Section */}
      <Card className="shadow-lg col-span-12 md:col-span-8 p-4">
        <Skeleton className="h-40 w-full rounded-lg" />
      </Card>
      <Card className="shadow-lg col-span-12 md:col-span-4 p-4">
        <Skeleton className="h-40 w-full rounded-lg" />
      </Card>

      {/* Statistics Section */}
      <div className="col-span-12 md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="p-4">
            <Skeleton className="h-20 w-20 rounded-full mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto mt-2" />
          </Card>
        ))}
      </div>

      {/* Interview Scores */}
      <Card className="col-span-12 md:col-span-6">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th><Skeleton className="h-6 w-20" /></th>
                  <th><Skeleton className="h-6 w-20" /></th>
                  <th><Skeleton className="h-6 w-20" /></th>
                </tr>
              </thead>
              <tbody>   
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td><Skeleton className="h-6 w-20" /></td>
                    <td><Skeleton className="h-6 w-40" /></td>
                    <td><Skeleton className="h-6 w-20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card className="shadow-lg md:col-span-6 p-4">
        <Skeleton className="h-40 w-full rounded-lg" />
      </Card>
    </div>
  );
}
