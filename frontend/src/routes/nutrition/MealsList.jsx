import React, { useEffect, useState } from "react";
import { fetcher } from "../../lib/fetcher";
import { Link } from "react-router";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

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
    <PageContainer>
      <PageHeader
        breadcrumbs={[{ label: "Nutrition" }]}
        title="Nutrition"
      >
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
      </PageHeader>

        {/* Search Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Your meals</h2>
          <div className="flex gap-2 max-w-md items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayMeals.map((meal) => (
            <Link
              to={`/nutrition/${meal.id}`}
              className="block group"
              key={meal.id}
            >
              <Card className="flex flex-col md:flex-row overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.01] border-2 hover:border-primary/50 h-full md:h-auto">
                {/* Image Section */}
                <div className="w-full h-48 md:w-48 md:h-48 flex-shrink-0 flex items-center justify-center p-4">
                  <img
                    src={meal.image_url}
                    alt={meal.name}
                    className="object-cover w-full h-full rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3 flex-col md:flex-row gap-2 md:gap-0">
                      <h3 className="text-lg md:text-2xl font-bold group-hover:text-primary transition-colors">
                        {meal.name}
                      </h3>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium whitespace-nowrap w-fit">
                        {meal.category}
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Calories:</span>
                        <span className="font-semibold text-lg">{meal.calories}</span>
                        <span className="text-muted-foreground">kcal</span>
                      </div>
                      <div className="hidden md:block h-4 w-px bg-border"></div>
                      <div className="text-muted-foreground text-xs md:text-sm">
                        {new Date(meal.scanned_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground group-hover:text-foreground transition-colors hidden md:block">
                    Click to view details →
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
    </PageContainer>
  );
};
