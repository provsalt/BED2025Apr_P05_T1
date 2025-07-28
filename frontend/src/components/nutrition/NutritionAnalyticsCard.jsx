import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/fetcher";
import { Link } from 'react-router';
import { PieChart } from 'lucide-react';

export const NutritionAnalyticsCard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
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
      const [analyticsRes, breakdownRes] = await Promise.all([
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics?days=${selectedPeriod}`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/daily?days=${selectedPeriod}`)
      ]);
      
      setAnalytics(analyticsRes.analytics);
      setDailyBreakdown(breakdownRes.breakdown);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-black" />
            Nutrition Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-black" />
            Nutrition Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchAnalytics} size="sm" className="bg-black hover:bg-gray-800 text-white">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-black" />
            Nutrition Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">No nutrition data available for the selected period.</p>
            <Link to="/nutrition/upload">
              <Button size="sm" className="bg-black hover:bg-gray-800 text-white">
                Add Your First Meal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-black" />
            Nutrition Analytics
          </div>
          <Link 
            to="/nutrition/analytics" 
            className="text-sm text-black hover:text-gray-700 hover:underline cursor-pointer"
          >
            View Full Analytics →
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Period Selector - Matching main page sizing */}
        <div className="flex gap-3">
          {[
            { days: 7, label: '7 Days' },
            { days: 30, label: '30 Days' },
            { days: 90, label: '90 Days' }
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
              } px-6 py-2 text-sm font-medium`}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Stats Cards - Matching main page white/black styling */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-black">
              {Math.round(analytics.avgDailyCalories || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg Daily Calories</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-black">
              {Math.round(analytics.avgProtein || 0)}g
            </div>
            <div className="text-sm text-gray-600">Avg Protein</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-black">
              {Math.round(analytics.avgCarbs || 0)}g
            </div>
            <div className="text-sm text-gray-600">Avg Carbs</div>
          </div>
        </div>

        {/* Recent Daily Breakdown */}
        <div className="space-y-2">
          <h4 className="font-semibold text-black">Recent Days</h4>
          {dailyBreakdown.length > 0 ? (
            <div className="space-y-2">
              {dailyBreakdown.slice(0, 3).map((day, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{formatDate(day.date)}</span>
                  <span className="font-semibold text-black">{Math.round(day.calories)} cal</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent data available</p>
          )}
        </div>

        {/* View All Link */}
        <div className="pt-2 border-t">
          <Link to="/nutrition/analytics">
            <Button variant="outline" className="w-full bg-white hover:bg-gray-50 text-black border-gray-300">
              View Analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
