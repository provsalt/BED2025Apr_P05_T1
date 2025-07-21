import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/provider/UserContext";
import { fetcher } from "@/lib/fetcher";
import AnnouncementsList from "@/components/announcements/AnnouncementsList.jsx";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";

export const Home = () => {
  const { isAuthenticated } = useContext(UserContext);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetcher("/home/user/summary")
        .then((data) => setSummary(data))
        .catch((err) => console.error("Failed to load summary", err));
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1 bg-gray-50 text-gray-900">
      <div className="mx-auto px-6 py-12">
        <AnnouncementsList
          isAdmin={false}
        />
        {isAuthenticated ? <Dashboard summary={summary} /> : <Landing />}
      </div>
    </div>
  );
};
