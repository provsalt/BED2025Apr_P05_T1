import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Dashboard = ({ summary }) => (
  <div className="space-y-10">
    <h1 className="text-3xl font-semibold">Welcome back!</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Recent Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.meals && summary.meals.length > 0 ? (
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
              {summary.meals.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No data available.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.events && summary.events.length > 0 ? (
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
              {summary.events.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No data available.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.medications && summary.medications.length > 0 ? (
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
              {summary.medications.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No data available.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
            <li>Calories: {summary?.nutrition?.calories || 0}</li>
            <li>Protein: {summary?.nutrition?.protein || 0}g</li>
            <li>Carbs: {summary?.nutrition?.carbs || 0}g</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Transport Bookmarks</CardTitle>
        </CardHeader>
        <CardContent>
          {summary?.transport && summary.transport.length > 0 ? (
            <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
              {summary.transport.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">No data available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);
