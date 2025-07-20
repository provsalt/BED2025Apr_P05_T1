import {Map} from "@/components/transport/Map.jsx";
import {useEffect, useState} from "react";
import {fetcher} from "@/lib/fetcher.js";
import TransportDirectionForm from "@/components/transport/TransportDirectionForm.jsx";
import TransitPlan from "@/components/transport/TransitPlan.jsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.jsx";
import {useSearchParams} from "react-router";

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
    <div className="flex h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1">
        <Breadcrumb className="p-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/transport">Transport</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Map</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Map path={path} setPath={setPath} delay={300} />
      </div>
      <div className="m-4 max-w-1/4">
        <TransportDirectionForm stations={stations} onSearch={handleSearch} />
        <TransitPlan path={path} stations={stations} />
      </div>
    </div>
  )
}