import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { fetcher } from "@/lib/fetcher";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";

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
