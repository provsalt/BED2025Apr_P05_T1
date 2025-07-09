import { Card } from "./Card";

export const Dashboard = ({ summary }) => (
  <div className="space-y-10">
    <h1 className="text-3xl font-semibold text-purple-900">Welcome back!</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card title="Recent Meals" content={summary?.meals} />
      <Card title="Upcoming Events" content={summary?.events} />
      <Card title="Medications" content={summary?.medications} />
      <Card
        title="Nutrition Summary"
        content={[
          `Calories: ${summary?.nutrition?.calories || 0}`,
          `Protein: ${summary?.nutrition?.protein || 0}g`,
          `Carbs: ${summary?.nutrition?.carbs || 0}g`,
        ]}
      />
      <Card title="Transport Bookmarks" content={summary?.transport} />
    </div>
  </div>
);
