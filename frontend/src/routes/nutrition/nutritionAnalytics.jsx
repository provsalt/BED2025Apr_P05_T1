import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { NutritionAnalytics } from "@/components/nutrition/NutritionAnalytics";
import { PageHeader } from "@/components/ui/page-header";

export const NutritionAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto px-6 py-8 w-full">
        <PageHeader
          breadcrumbs={[
            { label: "Nutrition", href: "/nutrition" },
            { label: "Analytics" },
          ]}
          title="Nutrition Analytics"
        >
          <Link to="/nutrition">
            <Button variant="outline" className="cursor-pointer">
              View All Meals
            </Button>
          </Link>
          <Link to="/nutrition/upload">
            <Button className="cursor-pointer">
              Upload Meal
            </Button>
          </Link>
        </PageHeader>
        <p className="text-sm text-gray-600 mb-6">
          Track your nutrition progress and get insights into your eating patterns
        </p>
        <NutritionAnalytics />
      </div>
    </div>
  );
};
