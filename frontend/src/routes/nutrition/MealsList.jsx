import React, { useEffect, useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, X } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const MealsList = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

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
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/search?name=${encodeURIComponent(searchTerm.trim())}`);
      setSearchResults(res.meals || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
    setHasSearched(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Only show searchResults after a search, otherwise show all meals
  const displayMeals = hasSearched ? searchResults : meals;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-muted-foreground text-lg">Loading meals...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-destructive text-lg mb-4">Failed to load meals</div>
      <div className="text-muted-foreground text-sm mb-4">{error}</div>
      <Button 
        onClick={() => window.location.reload()} 
        className="cursor-pointer"
      >
        Try Again
      </Button>
    </div>
  );
  if (!meals.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xl font-semibold">
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
          <div className="flex gap-2">
            <Link to="/nutrition/analytics">
              <Button variant="outline" className="cursor-pointer">
                View Analytics
              </Button>
            </Link>
            <Link to="/nutrition/upload">
              <Button className="cursor-pointer">
                Upload Image
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="flex gap-2 max-w-md items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Search meals by name..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                className="px-6"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

        {/* No search results message */}
        {hasSearched && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No meals found matching "{searchTerm}"</p>
            <p className="text-sm mt-2">Try searching for different terms or check your spelling</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMeals.map((meal) => (
            <Link
              to={`/nutrition/${meal.id}`}
              className="inline-block mt-3 text-muted-foreground hover:text-foreground font-medium overflow-hidden"
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
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{meal.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
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
