import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { Activity, TrendingUp, Utensils } from 'lucide-react';

export const NutritionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [caloriesTrend, setCaloriesTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, breakdownRes, trendRes] = await Promise.all([
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics?days=${selectedPeriod}`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/daily?days=${selectedPeriod}`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/trend?days=${selectedPeriod}`)
      ]);
      
      setAnalytics(analyticsRes.analytics);
      setDailyBreakdown(breakdownRes.breakdown);
      setCaloriesTrend(trendRes.trend);
    } catch (err) {
      setError(err.message || "Failed to fetch nutrition analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMaxCalories = () => {
    if (!caloriesTrend.length) return 1000;
    return Math.max(...caloriesTrend.map(day => day.calories || 0));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded mb-6"></div>
        <div className="h-80 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>Try Again</Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No nutrition data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Time Period Selector */}
      <div className="flex gap-2 justify-center mb-6">
        {[
          { days: 7, label: '7 Days' },
          { days: 30, label: '30 Days' }
        ].map(period => (
          <Button
            key={period.days}
            variant={selectedPeriod === period.days ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period.days)}
            className={`${
              selectedPeriod === period.days 
                ? "bg-black hover:bg-gray-800 text-white" 
                : "bg-white hover:bg-gray-50 text-black border-gray-300"
            } px-4 py-1 text-sm`}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-full">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Average Daily Calories</p>
                <p className="text-2xl font-bold text-black">
                  {Math.round(analytics.avgDailyCalories || 0)}
                </p>
                <p className="text-xs text-gray-500">calories per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Average Protein</p>
                <p className="text-2xl font-bold text-black">
                  {Math.round(analytics.avgProtein || 0)}g
                </p>
                <p className="text-xs text-gray-500">grams per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-full">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Average Carbohydrates</p>
                <p className="text-2xl font-bold text-black">
                  {Math.round(analytics.avgCarbs || 0)}g
                </p>
                <p className="text-xs text-gray-500">grams per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-full">
                <Utensils className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Meals Tracked</p>
                <p className="text-2xl font-bold text-black">
                  {analytics.totalMeals || 0}
                </p>
                <p className="text-xs text-gray-500">meals recorded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Calories Trend */}
      <Card className="mb-6 border border-gray-300">
        <CardHeader className="bg-white border-b border-gray-300">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-black p-2 rounded-full">
              <Activity className="w-4 h-4 text-white" />
            </div>
            Daily Calories Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {caloriesTrend.length > 0 ? (
            <div className="space-y-3">
              {caloriesTrend.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="min-w-24 font-medium text-gray-700 text-sm">
                    {formatDate(day.date)}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-black h-6 rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${Math.min((day.calories / getMaxCalories()) * 100, 100)}%` }}
                    >
                      <span className="text-white font-medium text-xs">
                        {day.calories} cal
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">No calorie data available for this period</p>
          )}
        </CardContent>
      </Card>

      {/* Daily Breakdown Table */}
      <Card className="border border-gray-300">
        <CardHeader className="bg-white border-b border-gray-300">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="bg-black p-2 rounded-full">
              <Activity className="w-4 h-4 text-white" />
            </div>
            Daily Nutrition Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {dailyBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 px-3 font-medium text-black text-sm">Date</th>
                    <th className="text-center py-2 px-3 font-medium text-black text-sm">Meals</th>
                    <th className="text-center py-2 px-3 font-medium text-black text-sm">Calories</th>
                    <th className="text-center py-2 px-3 font-medium text-black text-sm">Protein</th>
                    <th className="text-center py-2 px-3 font-medium text-black text-sm">Carbs</th>
                    <th className="text-center py-2 px-3 font-medium text-black text-sm">Fat</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.map((day, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div>
                          <div className="font-medium text-black text-sm">{formatDate(day.date)}</div>
                          <div className="text-xs text-gray-600">{day.day_name}</div>
                        </div>
                      </td>
                      <td className="text-center py-2 px-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-black">
                          {day.meals || 0}
                        </span>
                      </td>
                      <td className="text-center py-2 px-3 font-medium text-black text-sm">
                        {Math.round(day.calories || 0)}
                      </td>
                      <td className="text-center py-2 px-3 font-medium text-black text-sm">
                        {Math.round(day.protein || 0)}g
                      </td>
                      <td className="text-center py-2 px-3 font-medium text-black text-sm">
                        {Math.round(day.carbs || 0)}g
                      </td>
                      <td className="text-center py-2 px-3 font-medium text-black text-sm">
                        {Math.round(day.fat || 0)}g
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">No daily breakdown data available for this period</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
