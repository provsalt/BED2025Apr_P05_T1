import { useState, useEffect, useCallback } from "react";
import { fetcher } from "@/lib/fetcher";

export function useDashboardData(isAuthenticated) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    Promise.allSettled([
      fetcher('/nutrition'),
      fetcher('/medications'),
      fetcher('/transport/routes'),
      fetcher('/community'),
    ]).then((results) => {
      // Each result: { status, value | reason }
      const [mealsRes, medsRes, transportRes, eventsRes] = results.map(r => r.value || {});
      const meals = mealsRes.meals || [];
      const nutrition = meals.reduce(
        (acc, meal) => {
          acc.calories += Number(meal.calories) || 0;
          acc.protein += Number(meal.protein) || 0;
          acc.carbs += Number(meal.carbohydrates) || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0 }
      );
      setSummary({
        meals: meals.slice(0, 3),
        medications: (medsRes.reminders || []).slice(0, 3),
        transport: (transportRes || []).slice(0, 3),
        events: (eventsRes.events || []).slice(0, 3),
        nutrition,
      });
      // If any failed, set error but still show partial data
      if (results.some(r => r.status === 'rejected')) {
        setError('Some data failed to load.');
      }
    }).catch((err) => {
      setError('Failed to load dashboard data.');
      setSummary(null);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { summary, loading, error, fetchDashboardData };
} 