import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router';
import {useAlert} from '@/provider/AlertProvider';
import {fetcher} from '@/lib/fetcher';
import RouteForm from '@/components/transport/RouteForm';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

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
        const data = await fetcher(`/transport/routes/${id}`);
        setInitialData(data);
      } catch (error) {
        console.error('Error fetching route:', error);
        alert.error({
          title: 'Error',
          content: 'Failed to fetch route data.',
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
      alert.success('Route updated successfully.');
      navigate('/transport/routes');
    } catch (error) {
      console.error('Error updating route:', error);
      alert.error({
        title: 'Error',
        content: error.message,
      });
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
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/transport/routes">Routes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h2 className="text-2xl font-bold mb-4">Edit Route</h2>
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
  );
};

