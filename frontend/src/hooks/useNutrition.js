import { useState, useCallback } from 'react';
import { fetcher } from '@/lib/fetcher';


/**
 * Custom hook for nutrition analytics
 */
export const useNutritionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [caloriesTrend, setCaloriesTrend] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    
    try {
      const [analyticsRes, breakdownRes, trendRes] = await Promise.all([
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics?days=${days}`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/daily?days=${days}`),
        fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/trend?days=${days}`)
      ]);
      
      setAnalytics(analyticsRes.analytics || {});
      setDailyBreakdown(breakdownRes.breakdown || []);
      setCaloriesTrend(trendRes.trend || []);
    } catch (err) {
      console.error('Failed to fetch nutrition analytics:', err);
      setError(err.message || "Failed to fetch nutrition analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    dailyBreakdown,
    caloriesTrend,
    loading,
    error,
    fetchAnalytics
  };
};
