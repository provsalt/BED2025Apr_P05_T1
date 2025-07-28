import { useState, useEffect, useCallback } from "react";
import { fetcher } from "@/lib/fetcher";

export function useDashboardData(isAuthenticated) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDashboardData = useCallback(async (isRetry = false) => {
    if (!isAuthenticated) {
      setSummary(null);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      return;
    }
    
    setLoading(true);
    if (!isRetry) {
      setError(null);
    }
    
    try {
      const results = await Promise.allSettled([
        fetcher('/nutrition').catch(err => {
          console.warn('Nutrition API failed:', err);
          return { meals: [] };
        }),
        fetcher('/medications').catch(err => {
          console.warn('Medications API failed:', err);
          return { reminders: [] };
        }),
        fetcher('/transport/routes').catch(err => {
          console.warn('Transport API failed:', err);
          return [];
        }),
        fetcher('/community').catch(err => {
          console.warn('Community API failed:', err);
          return { events: [] };
        }),
      ]);

      const [mealsRes, medsRes, transportRes, eventsRes] = results.map(r => {
        if (r.status === 'fulfilled') {
          return r.value;
        } else {
          console.warn('API call failed:', r.reason);
          return null;
        }
      });

      const meals = (mealsRes?.meals || []);
      const nutrition = meals.reduce(
        (acc, meal) => {
          acc.calories += Number(meal.calories) || 0;
          acc.protein += Number(meal.protein) || 0;
          acc.carbs += Number(meal.carbohydrates) || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0 }
      );

      const newSummary = {
        meals: meals.slice(0, 3),
        medications: (medsRes?.reminders || []).slice(0, 3),
        transport: (Array.isArray(transportRes) ? transportRes : []).slice(0, 3),
        events: (eventsRes?.events || []).slice(0, 3),
        nutrition,
      };

      setSummary(newSummary);
      setRetryCount(0);

      const failedCount = results.filter(r => r.status === 'rejected').length;
      if (failedCount > 0) {
        setError(`${failedCount} of 4 data sources failed to load, but partial data is shown.`);
      } else {
        setError(null);
      }

    } catch (err) {
      console.error('Dashboard data fetch failed:', err);
      
      if (retryCount < 2 && !isRetry) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchDashboardData(true);
        }, 1000 * (retryCount + 1));
        setError(`Network error. Retrying... (${retryCount + 1}/3)`);
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
        setSummary(null);
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, retryCount]);

  useEffect(() => {
    if (isAuthenticated) {
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 100);
      return () => clearTimeout(timeoutId);
    } else {
      setSummary(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchDashboardData]);

  return { summary, loading, error, fetchDashboardData };
} 