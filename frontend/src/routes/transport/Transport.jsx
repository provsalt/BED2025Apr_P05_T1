import {Map} from "@/components/transport/Map.jsx";
import {useEffect, useState} from "react";
import {fetcher} from "@/lib/fetcher.js";
import TransportDirectionForm from "@/components/transport/TransportDirectionForm.jsx";
import TransitPlan from "@/components/transport/TransitPlan.jsx";

export const Transport = () => {

  const [path, setPath] = useState([]);
  const [stations, setStations] = useState(null);

  useEffect(() => {
    fetcher("/transport/stations").then(r => r).then((d) => {
      setStations(d.codeNameMap);
    })
  }, [])

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
      <div className="flex-1 overflow-auto">
        <Map path={path} setPath={setPath} delay={300} />
      </div>
      <div className="m-4 max-w-1/4">
        <TransportDirectionForm stations={stations} onSearch={handleSearch} />
        <TransitPlan path={path} stations={stations} />
      </div>
    </div>
  )
}