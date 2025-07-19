import React, { useEffect, useState } from "react";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router";
import {Button} from "@/components/ui/button.jsx";

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetcher("/transport/routes");
        setRoutes(response);
      } catch (error) {
        console.error("Error fetching routes:", error);
        showAlert("Failed to fetch routes.", "error");
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
        showAlert("Failed to load stations.", "error");
      }
    };

    loadStations().then();
    fetchRoutes().then();
  }, [showAlert]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading routes...</div>;
  }


  return (
    <div className="container mx-auto p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/transport">Transport</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Routes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-2xl font-bold mb-4">Your Routes</h2>
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
                  <TableCell>{stations[route["start_station"]]}</TableCell>
                  <TableCell>{stations[route["end_station"]]}</TableCell>
                  <TableCell className="flex gap-4">
                    <Button>
                      View
                    </Button>
                    <Button variant="secondary">
                      Edit
                    </Button>
                    <Button variant="destructive">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default RouteList;
