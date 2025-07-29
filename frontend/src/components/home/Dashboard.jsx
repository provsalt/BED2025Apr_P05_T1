import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Link } from "react-router";
import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import { NutritionAnalyticsCard } from "@/components/nutrition/NutritionAnalyticsCard";
import { AIPredictions } from "@/components/ai/AIPredictions";
import { NutritionAreaChart } from "@/components/charts/NutritionAreaChart";
import { 
  Apple, 
  Dumbbell, 
  Pill, 
  Calendar, 
  Utensils,
  Camera,
  Clock,
  PartyPopper,
  Bus,
  MapPin,
  CalendarDays,
  User
} from "lucide-react";

export const Dashboard = ({ summary }) => {
  const { id: userId } = useContext(UserContext);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Health Dashboard</h1>
            <p className="text-lg text-gray-600">Track your nutrition, medications, and community activities</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Nutrition Stats */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black p-2 rounded-full">
                  <Apple className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Calories</h3>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                {Math.round(summary?.nutrition?.calories || 0)}
              </div>
              <p className="text-xs text-gray-500">calories consumed</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black p-2 rounded-full">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Protein Intake</h3>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                {Math.round(summary?.nutrition?.protein || 0)}g
              </div>
              <p className="text-xs text-gray-500">protein consumed</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black p-2 rounded-full">
                  <Pill className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Medications</h3>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                {summary?.medications?.length || 0}
              </div>
              <p className="text-xs text-gray-500">active medications</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-black p-2 rounded-full">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Upcoming Events</h3>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                {summary?.events?.length || 0}
              </div>
              <p className="text-xs text-gray-500">community events</p>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Meals Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Meals</h2>
                <Link 
                  to="/nutrition" 
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  View all meals →
                </Link>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {summary?.meals && summary.meals.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {summary.meals.slice(0, 3).map((meal, i) => (
                      <Link 
                        to={`/nutrition/${meal.id}`} 
                        key={meal.id || i} 
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition cursor-pointer"
                      >
                        {meal.image_url && (
                          <img 
                            src={
                              meal.image_url.startsWith("/api/")
                                ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001") + meal.image_url
                                : meal.image_url
                            } 
                            alt={meal.name} 
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200" 
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{meal.name}</h3>
                            {meal.category && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {meal.category}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {meal.calories} calories
                          </div>
                          <div className="text-xs text-gray-500">
                            {meal.scanned_at ? new Date(meal.scanned_at).toLocaleString() : ''}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No meals recorded yet</p>
                    <Link 
                      to="/nutrition" 
                      className="text-sm text-gray-900 hover:underline mt-2 inline-block"
                    >
                      Add your first meal →
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Nutrition Trends Chart */}
            <section>
              <NutritionAreaChart />
            </section>

            {/* Nutrition Analytics Section */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Nutrition Analytics</h2>
              <NutritionAnalyticsCard />
            </section>

            {/* Community Events Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Community Events</h2>
                <Link 
                  to="/community" 
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  View all events →
                </Link>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {summary?.events && summary.events.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {summary.events.slice(0, 3).map((event, i) => (
                      <Link to="/community" key={event.id || i} className="block p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start gap-4">
                          {event.image_url && (
                            <img 
                              src={
                                event.image_url.startsWith("/api/")
                                  ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001") + event.image_url
                                  : event.image_url
                              } 
                              alt={event.name} 
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" 
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
                              {event.user_id === userId && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  Created by you
                                </span>
                              )}
                              {event.category && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {event.category}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {event.date ? new Date(event.date).toLocaleDateString() : ''} {event.time}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <PartyPopper className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming events</p>
                    <Link 
                      to="/community" 
                      className="text-sm text-gray-900 hover:underline mt-2 inline-block"
                    >
                      Explore community events →
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Medications Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today's Medications</h2>
                <Link 
                  to="/medical/reminders" 
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {summary?.medications && summary.medications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {summary.medications.slice(0, 3).map((med, i) => (
                      <Link 
                        to="/medical/reminders" 
                        key={med.id || i} 
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 transition cursor-pointer"
                      >
                        {med.image_url && (
                          <img
                            src={
                              med.image_url.startsWith("/api/")
                                ? (import.meta.env.VITE_BACKEND_URL || "http://localhost:3001") + med.image_url
                                : med.image_url
                            }
                            alt={med.medicine_name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{med.medicine_name}</h3>
                          <p className="text-sm text-gray-600 truncate">{med.dosage}</p>
                          <p className="text-sm text-gray-500">{med.medicine_time}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Pill className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No medications scheduled</p>
                  </div>
                )}
              </div>
            </section>

            {/* Transport Bookmarks Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Transport Bookmarks</h2>
                <Link 
                  to="/transport" 
                  className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {summary?.transport && summary.transport.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {summary.transport.slice(0, 4).map((item, i) => (
                      <Link 
                        to="/transport" 
                        key={item.id || i} 
                        className="block p-3 hover:bg-gray-50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name || `${item.start_station} → ${item.end_station}`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Bus className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No bookmarks saved</p>
                  </div>
                )}
              </div>
            </section>

            {/* AI Predictions Section */}
            <AIPredictions isAuthenticated={!!userId} />

            {/* Quick Actions */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/nutrition" 
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="bg-black p-2 rounded-full mb-3">
                      <Camera className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center text-gray-700 font-medium">Scan Meal</span>
                  </Link>
                  <Link 
                    to="/medical/reminders" 
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="bg-black p-2 rounded-full mb-3">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center text-gray-700 font-medium">Add Reminder</span>
                  </Link>
                  <Link 
                    to="/community" 
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="bg-black p-2 rounded-full mb-3">
                      <PartyPopper className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center text-gray-700 font-medium">Join Event</span>
                  </Link>
                  <Link 
                    to="/transport" 
                    className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  >
                    <div className="bg-black p-2 rounded-full mb-3">
                      <Bus className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-center text-gray-700 font-medium">Plan Route</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
            <div className="h-6 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
