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
    <PageContainer className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <PageHeader
        breadcrumbs={[
          { label: "Transport", href: "/transport" },
          { label: "Map" },
        ]}
        title="Transport Map"
      />
      <div className="flex flex-col-reverse md:flex-row flex-1 gap-4">
        {/* Map - shows below form on mobile, left side on desktop */}
        <div className="flex-1 min-h-[300px] md:min-h-0">
          <Map path={path} setPath={setPath} delay={300} />
        </div>
        {/* Sidebar - shows above map on mobile, right side on desktop */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <TransportDirectionForm stations={stations} onSearch={handleSearch} />
          <TransitPlan path={path} stations={stations} />
        </div>
      </div>
    </PageContainer>
  );
}