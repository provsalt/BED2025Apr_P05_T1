import React from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { NutritionAnalytics } from '@/components/nutrition/NutritionAnalytics';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const NutritionAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb className="p-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/nutrition">Nutrition</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbPage>Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-6">Nutrition Analytics</h1>
              <p className="text-sm text-gray-600">
                Track your nutrition progress and get insights into your eating patterns
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/nutrition">
                <Button variant="outline" className="bg-white hover:bg-gray-50 text-black border-gray-300">
                  View All Meals
                </Button>
              </Link>
              <Link to="/nutrition/upload">
                <Button className="bg-primary hover:bg-gray-800 text-white">
                  Upload Meal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Component */}
        <NutritionAnalytics />
      </div>
    </div>
  );
};
