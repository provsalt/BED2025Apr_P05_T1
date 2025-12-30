import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher.js";
import RouteForm from "@/components/transport/RouteForm";
import { PageHeader } from "@/components/ui/page-header";

export const CreateRoute = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const alert = useAlert();

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
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
      alert.success({
        title: "Success",
        description: "Successfully updated route",
      });
      navigate("/transport/routes");
    } catch (error) {
      console.error("Error creating route:", error);
      alert.error({
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        breadcrumbs={[
          { label: "Transport", href: "/transport" },
          { label: "Routes", href: "/transport/routes" },
          { label: "Create" },
        ]}
        title="Create New Route"
      />
      <RouteForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText="Create Route"
      />
    </div>
  );
};