import { useContext } from "react";
import { UserContext } from "@/provider/UserContext";
import AnnouncementsList from "@/components/announcements/AnnouncementsList.jsx";
import { Dashboard } from "@/components/home/Dashboard";
import { Landing } from "@/components/home/Landing";
import { Button } from "@/components/ui/button.jsx";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSkeleton } from "@/components/home/Dashboard";

export const Home = () => {
  const { isAuthenticated, id: userId } = useContext(UserContext);
  const { summary, loading, error, fetchDashboardData } = useDashboardData(isAuthenticated);

  return (
    <div className="flex-1 bg-gray-50 text-gray-900">
      <div className="mx-auto px-6 py-12">
        <AnnouncementsList isAdmin={false} />
        <div className="mb-4 flex justify-end">
          {isAuthenticated && (
            <Button onClick={fetchDashboardData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        {isAuthenticated ? (
          loading ? <DashboardSkeleton /> : <Dashboard key={userId} summary={summary} />
        ) : (
          <Landing />
        )}
      </div>
    </div>
  );
};
