import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { fetcher } from "@/lib/fetcher";

export const Home = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetcher("/api/user/summary")
        .then((data) => setSummary(data))
        .catch((err) => console.error("Failed to load summary", err));
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {isAuthenticated ? <Dashboard summary={summary} /> : <Landing />}
      </div>
    </div>
  );
};

const Landing = () => (
  <div className="flex flex-col items-center justify-center text-center space-y-6 py-28 bg-white">
    <h1 className="text-5xl font-extrabold text-purple-800">Welcome to ElderCare</h1>
    <p className="text-gray-600 max-w-xl text-lg">
      Supporting seniors with medical reminders, nutrition tracking, transport planning, and community events.
    </p>
    <div className="space-x-6 flex items-center">
      <a
        href="/login"
        className="bg-purple-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-purple-800 transition"
      >
        Login
      </a>

      <a
        href="/signUp"
        className="relative text-purple-700 font-medium after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-purple-500 after:scale-x-0 hover:after:scale-x-100 after:origin-left after:transition-transform after:duration-300"
      >
        Create an Account
      </a>
    </div>
  </div>
);


const Dashboard = ({ summary }) => (
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

const Card = ({ title, content }) => (
  <div className="bg-white rounded-xl shadow p-6">
    <h2 className="text-xl font-bold mb-2 text-purple-700">{title}</h2>
    {content && content.length > 0 ? (
      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
        {content.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-400 italic">No data available.</p>
    )}
  </div>
);
