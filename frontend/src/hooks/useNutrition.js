import { useState, useCallback } from 'react';
import { fetcher } from '@/lib/fetcher';

/**
 * Custom hook for managing AI predictions
 */
export const useAIPredictions = () => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const fetchPredictions = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetcher(`/nutrition/ai-predictions?days=${days}`);
      setPredictions(data);
      setHasGenerated(true);
    } catch (err) {
      console.error('Failed to fetch AI predictions:', err);
      
      // Handle specific error cases
      if (err.message.includes('User not authenticated')) {
        setError('Please log in to view AI predictions');
      } else if (err.message.includes('Failed to fetch meal') || err.message.includes('No nutrition data')) {
        setError('No nutrition data available yet. Upload some meals to get AI insights!');
      } else if (err.message.includes('Rate limit')) {
        setError('Too many requests. Please try again in a few minutes.');
      } else {
        setError('Unable to load AI predictions at the moment');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPredictions(null);
    setError(null);
    setHasGenerated(false);
  }, []);

  return {
    predictions,
    loading,
    error,
    hasGenerated,
    fetchPredictions,
    reset
  };
};

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
