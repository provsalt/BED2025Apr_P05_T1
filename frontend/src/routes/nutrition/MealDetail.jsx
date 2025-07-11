import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { fetcher } from "../../lib/fetcher";
import { Card } from "../../components/ui/card";
import {CircleChevronLeft} from "lucide-react";

export const MealDetail = () => {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/food/${id}`);
        setMeal(res.meal);
      } catch (err) {
        setError(err.message || "Failed to fetch meal");
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  if (loading) return <div>Loading meal...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!meal) return <div>Meal not found.</div>;

  return (
    <div className="p-3">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden relative">
          <Link to="/nutrition/food" className="absolute top-4 left-4 z-10">
            <CircleChevronLeft size={32} className="hover:text-gray-700 transition-colors cursor-pointer" />
          </Link>
          <div className="w-full flex justify-center items-center mb-6">
            <img 
              src={meal.image_url} 
              alt={meal.name} 
              style={{ maxWidth: '100%', maxHeight: 400, height: 'auto', width: 'auto', display: 'block', borderRadius: '0.75rem' }}
            />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{meal.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-800">Category</h3>
                <p className="text-gray-600">{meal.category}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Calories</h3>
                <p className="text-gray-600">{meal.calories}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Carbohydrates (g)</h3>
                <p className="text-gray-600">{meal.carbohydrates}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Protein (g)</h3>
                <p className="text-gray-600">{meal.protein}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Fat (g)</h3>
                <p className="text-gray-600">{meal.fat}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Scanned</h3>
                <p className="text-gray-600">{new Date(meal.scanned_at).toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-800">Ingredients</h3>
                <p className="text-gray-600">{meal.ingredients}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};