import React, { useEffect, useState } from "react";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher.js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.jsx";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

export const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState({});
  const [loading, setLoading] = useState(true);
  const alert = useAlert();
  const navigate = useNavigate();

  const fetchRoutes = async () => {
    try {
      const response = await fetcher("/transport/routes");
      setRoutes(response.data || response);
    } catch (error) {
      console.error("Error fetching routes:", error);
      alert.error({
        title: "Error",
        description: "Error fetching routes",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStations = async () => {
    try {
      const stationsData = await fetcher("/transport/stations");
      setStations(stationsData.codeNameMap);
    } catch (error) {
      console.error("Error loading stations:", error);
      alert.error({
        title: "Error",
        description: "Error fetching stations",
      });
    }
  };

  useEffect(() => {
    loadStations();
    fetchRoutes();
  }, []);

  const handleDelete = async (routeId) => {
    try {
      await fetcher(`/transport/routes/${routeId}`, {method: "DELETE"});
      alert.success({
        title: "Success",
        description: "Successfully deleted route",
      });
      fetchRoutes();
    } catch (error) {
      console.error("Error deleting route:", error);
      alert.error({
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading routes...</div>;
  }

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Transport", href: "/transport" },
          { label: "Routes" },
        ]}
        title="Your Routes"
      />
      {!routes || routes.length === 0 ? (
        <p>No routes found. Create a new route to get started!</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Start Location</TableHead>
                <TableHead>End Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.name}</TableCell>
                  <TableCell>{stations[route.start_station]}</TableCell>
                  <TableCell>{stations[route.end_station]}</TableCell>
                  <TableCell className="flex gap-4">
                    <Button asChild>
                      <Link to={`/transport/map?start=${route.start_station}&end=${route.end_station}`}>View</Link>
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(`/transport/routes/edit/${route.id}`)}>
                      Edit
                    </Button>
                    <AlertDialog>
                      <Button variant="destructive" asChild>
                        <AlertDialogTrigger>
                          Delete
                        </AlertDialogTrigger>
                      </Button>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the route
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <Button variant="destructive" asChild>
                            <AlertDialogAction onClick={() => {
                              handleDelete(route.id).then()
                            }}>Delete</AlertDialogAction>
                          </Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </PageContainer>
  );
};
