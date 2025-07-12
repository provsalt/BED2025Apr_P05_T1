import React, { useEffect, useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export const MealsList = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition`);
        setMeals(res.meals || []);
      } catch (err) {
        setError(err.message || "Failed to fetch meals");
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  if (loading) return <div>Loading meals...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!meals.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 text-xl font-semibold">
      <div>No Meals Scanned</div>
      <div className="mt-4">
          <Link to="/nutrition/upload">
          <Button className="cursor-pointer">
            Upload Image
          </Button>
          </Link>
      </div>
    </div>
  );

  return (
    <div className="p-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-left">Your Meals</h1>
          <Link to="/nutrition/upload" className="ml-4">
          <Button className="cursor-pointer">
            Upload Image
          </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <Link
              to={`/nutrition/${meal.id}`}
              className="inline-block mt-3 text-gray-600 hover:text-gray-800 font-medium overflow-hidden"
              key={meal.id}
            >
              <Card className="flex flex-col h-96 w-full min-w-[280px] max-w-[400px] mx-auto overflow-hidden transition-shadow hover:shadow-lg">
                <div className="h-48 w-full flex justify-center items-center">
                  <img 
                    src={meal.image_url} 
                    alt={meal.name} 
                    className="object-contain max-h-44 max-w-full rounded-md"
                  />
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{meal.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Category: {meal.category}</div>
                      <div>Calories: {meal.calories}</div>
                      <div>Scanned: {new Date(meal.scanned_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
