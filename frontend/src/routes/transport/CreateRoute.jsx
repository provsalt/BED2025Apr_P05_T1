import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher.js";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router";
import RouteForm from "@/components/transport/RouteForm";

const CreateRoute = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        startLocation: data.startStation.value,
        endLocation: data.endStation.value,
      };

      await fetcher("/transport/routes", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          start_station: data.startStation.value,
          end_station: data.endStation.value,
        }),
        headers: {
          "Content-Type": "application/json",
        }
      });
      
      showAlert("Route created successfully!", "success");
      navigate("/transport/routes");
    } catch (error) {
      console.error("Error creating route:", error);
      showAlert("Failed to create route.", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
            <BreadcrumbLink asChild>
              <Link to="/transport/routes">Routes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-2xl font-bold mb-4">Create New Route</h2>
      <RouteForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Create Route"
      />
    </div>
  );
};

export default CreateRoute;
