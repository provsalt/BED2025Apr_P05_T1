import React, { useEffect, useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, X } from "lucide-react";

export const MealsList = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/search?name=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(res.meals || []);
    } catch (err) {
      setError(err.message || "Failed to search meals");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Determine which meals to display
  const displayMeals = searchResults.length > 0 || isSearching ? searchResults : meals;

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

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex gap-2 max-w-md items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search meals by name..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !searchTerm.trim()}
              className="cursor-pointer"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMeals.map((meal) => (
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

        {/* No search results message */}
        {searchResults.length === 0 && searchTerm.trim() && !isSearching && (
          <div className="text-center py-8 text-gray-500">
            <p>No meals found matching "{searchTerm}"</p>
            <p className="text-sm mt-2">Try searching for different terms or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
};
