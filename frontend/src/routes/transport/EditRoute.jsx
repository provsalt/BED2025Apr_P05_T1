import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher";
import RouteForm from "@/components/transport/RouteForm";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

export const EditRoute = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const alert = useAlert();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      setIsLoading(true);
      try {
        const response = await fetcher(`/transport/routes/${id}`);
        console.log(response)
        setInitialData(response.data || response);
      } catch (error) {
        console.error('Error fetching route:', error);
        alert.error({
          title: 'Error',
          description: 'Failed to fetch route data.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoute();
  }, [id]);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await fetcher(`/transport/routes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          start_station: data.startStation.value,
          end_station: data.endStation.value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert.success({
        title: "Success",
        description: "Successfully updated route",
      });
      navigate('/transport/routes');
    } catch (error) {
      console.error('Error updating route:', error);
      alert.error({
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        breadcrumbs={[
          { label: "Transport", href: "/transport" },
          { label: "Routes", href: "/transport/routes" },
          { label: "Edit" },
        ]}
        title="Edit Route"
      />
      <div>
        {initialData ? (
          <RouteForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isLoading={isLoading}
            submitButtonText="Update Route"
          />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </PageContainer>
  );
};

