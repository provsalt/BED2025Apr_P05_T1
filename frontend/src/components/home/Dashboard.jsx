import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Link } from "react-router";

export const Dashboard = ({ summary }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Recent Meals & Nutrition */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Recent Meals & Nutrition</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Meals */}
            <div className="mb-6">
              <div className="font-semibold text-lg mb-2">Recent Meals</div>
              {summary?.meals && summary.meals.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {summary.meals.map((meal, i) => (
                    <Link to={`/nutrition/${meal.id}`} key={meal.id || i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition cursor-pointer">
                      {meal.image_url && (
                        <img src={meal.image_url} alt={meal.name} className="w-20 h-20 object-cover rounded-lg border" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-lg flex items-center gap-2">{meal.name} {meal.category && <Chip variant="secondary">{meal.category}</Chip>}</div>
                        <div className="text-sm text-gray-600">Calories: {meal.calories}</div>
                        <div className="text-xs text-gray-500">Scanned: {meal.scanned_at ? new Date(meal.scanned_at).toLocaleString() : ''}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No data available.</p>
              )}
            </div>
            {/*nutrition Summary*/}
            <div>
              <div className="font-semibold text-lg mb-2">Nutrition Summary</div>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                <li>Calories: {summary?.nutrition?.calories || 0}</li>
                <li>Protein: {summary?.nutrition?.protein || 0}g</li>
                <li>Carbs: {summary?.nutrition?.carbs || 0}g</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Community Events*/}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Upcoming Community Events</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.events && summary.events.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-2">
                {summary.events.map((event, i) => (
                  <Link to="/community" key={event.id || i} className="min-w-[320px] max-w-xs w-full">
                    <Card className="h-full hover:shadow-lg transition cursor-pointer flex flex-col">
                      {event.image_url && (
                        <img src={event.image_url} alt={event.name} className="w-full h-40 object-cover rounded-t-lg border-b" />
                      )}
                      <CardContent className="flex-1 flex flex-col gap-2 p-4">
                        <div className="font-semibold text-lg flex items-center gap-2">{event.name} {event.category && <Chip variant="secondary">{event.category}</Chip>}</div>
                        <div className="text-sm text-gray-600">Location: {event.location}</div>
                        <div className="text-sm text-gray-600">Date: {event.date ? new Date(event.date).toLocaleDateString() : ''} {event.time}</div>
                        <div className="text-sm text-gray-600 line-clamp-2">{event.description}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No upcoming events.</p>
            )}
          </CardContent>
        </Card>

        {/* medications*/}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.medications && summary.medications.length > 0 ? (
              <div className="flex flex-col gap-4">
                {summary.medications.map((med, i) => (
                  <Link to="/medical/reminders" key={med.id || i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition cursor-pointer">
                    {med.image_url && (
                      <img
                        src={
                          med.image_url.startsWith("/api/")
                            ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001") + med.image_url
                            : med.image_url
                        }
                        alt={med.medicine_name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{med.medicine_name}</div>
                      <div className="text-sm text-gray-600">Reason: {med.reason}</div>
                      <div className="text-sm text-gray-600">Dosage: {med.dosage}</div>
                      <div className="text-sm text-gray-600">Time: {med.medicine_time}</div>
                      <div className="text-sm text-gray-600">Frequency: {med.frequency_per_day}x/day</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No data available.</p>
            )}
          </CardContent>
        </Card>

        {/* transport Bookmarks */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Transport Bookmarks</CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.transport && summary.transport.length > 0 ? (
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                {summary.transport.map((item, i) => (
                  <li key={item.id || i}>
                    <Link to="/transport" className="hover:underline cursor-pointer">{item.name || `${item.start_station} → ${item.end_station}`}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
