import { Map } from "@/components/transport/Map.jsx";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/fetcher.js";
import TransportDirectionForm from "@/components/transport/TransportDirectionForm.jsx";
import TransitPlan from "@/components/transport/TransitPlan.jsx";
import { useSearchParams } from "react-router";
import { PageHeader } from "@/components/ui/page-header";
import { PageContainer } from "@/components/ui/page-container";

export const TransportMap = () => {
  const [searchParams] = useSearchParams();
  const [path, setPath] = useState([]);
  const [stations, setStations] = useState(null);

  useEffect(() => {
    fetcher("/transport/stations").then(r => r).then((d) => {
      setStations(d.codeNameMap);
    })
  }, [])

  useEffect(() => {
    if (!searchParams.get("start") || !searchParams.get("end")) {
      return;
    }
    handleSearch(searchParams.get("start"), searchParams.get("end"));
  }, [searchParams]);

  const handleSearch = (start, end) => {
    setPath([]);
    fetcher(`/transport/shortest?start=${start}&end=${end}`).then(d => {
      const route = d.path.map((station) => station.code);
      console.log(route)
      setPath(route || []);
    })
  }

  return (
    <PageContainer className="flex flex-col h-[calc(100vh-theme(spacing.16))] flex-1">
      <PageHeader
        breadcrumbs={[
          { label: "Transport", href: "/transport" },
          { label: "Map" },
        ]}
        title="Transport Map"
      />
      <div className="flex flex-1">
        <div className="flex-1">
          <Map path={path} setPath={setPath} delay={300} />
        </div>
        <div className="m-4 md:max-w-1/4">
          <TransportDirectionForm stations={stations} onSearch={handleSearch} />
          <TransitPlan path={path} stations={stations} />
        </div>
      </div>
    </PageContainer>
  );
}