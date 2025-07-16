import {Map} from "@/components/transport/Map.jsx";
import {useEffect, useState} from "react";
import {fetcher} from "@/lib/fetcher.js";

export const Transport = () => {

  const [path, setPath] = useState([]);
  const [stations, setStations] = useState(null);
  useEffect(() => {
    fetcher("/transport/stations").then(r => r).then((d) => {
      setStations(d.codeNameMap);
    })
    fetcher("/transport/shortest?start=EW1&end=EW31").then(d => {
      const route = d.path.map((station) => station.code);
      console.log(route)
      setPath(route || []);
    })
  }, [])
  return (
    <div className="flex">
      <Map path={path} setPath={setPath} delay={250} />
      <div className="">
        <h1>Transport</h1>
      </div>
    </div>
  )
}