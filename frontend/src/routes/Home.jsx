import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { fetcher } from "@/lib/fetcher";
import AnnouncementsList from "@/components/announcements/AnnouncementsList.jsx";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";

export const Home = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        fetcher('/nutrition'),
        fetcher('/medications'),
        fetcher('/transport/routes'),
        fetcher('/community/events'),
      ])
        .then(([mealsRes, medsRes, transportRes, eventsRes]) => {
          const meals = mealsRes.meals || [];
          // Nutrition summary calculation
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
        })
        .catch((err) => {
          console.error('Failed to load dashboard data', err);
          setSummary(null);
        });
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1 bg-gray-50 text-gray-900">
      <div className="mx-auto px-6 py-12">
        <AnnouncementsList
          isAdmin={false}
        />
        {isAuthenticated ? <Dashboard summary={summary} /> : <Landing />}
      </div>
    </div>
  );
};
