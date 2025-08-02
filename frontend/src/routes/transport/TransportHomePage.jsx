import React from "react";
import {Bus, Map, PlusSquare} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {useNavigate} from "react-router";

export const TransportHomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col flex-1 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-foreground mb-8">Transport Hub</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/transport/map")}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Map className="w-8 h-8 text-primary-foreground"/>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Shortest Route</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find the shortest route between two stations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/transport/routes")}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Bus className="w-8 h-8 text-primary-foreground"/>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">My Routes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                View and manage your saved routes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate("/transport/routes/create")}>
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <PlusSquare className="w-8 h-8 text-primary-foreground"/>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Create New Route</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create and save a new transport route.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}