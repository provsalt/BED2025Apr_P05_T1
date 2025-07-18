import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import {Label} from "@/components/ui/label.jsx";

const TransportDirectionForm = ({ stations, onSearch }) => {
  const [startStation, setStartStation] = useState(null);
  const [endStation, setEndStation] = useState(null);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [error, setError] = useState(null);

  const stationList = stations ? Object.keys(stations).map(key => ({
    value: key,
    label: stations[key],
  })) : [];

  const handleSearch = () => {
    if (!startStation || !endStation) {
      setError("Please select both a starting and ending station.");
      return;
    }
    if (startStation.value === endStation.value) {
      setError("Start and end stations cannot be the same.");
      return;
    }
    setError(null);
    onSearch(startStation.value, endStation.value);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Reach your destination faster!</h2>
        <p className="text-wrap">With Eldercare, you can rely on our system to provide you helpful directions to reach your destination fast!</p>
        <Label>Start station</Label>
        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openStart}
              className="w-full justify-between"
            >
              {startStation ? startStation.label : "Select start station..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search station..." />
              <CommandList>
                <CommandEmpty>No station found.</CommandEmpty>
                <CommandGroup>
                  {stationList.map((station) => (
                    <CommandItem
                      key={station.value}
                      value={station.label}
                      onSelect={(currentValue) => {
                        setStartStation(
                          stationList.find((s) => s.label.toLowerCase() === currentValue.toLowerCase())
                        );
                        setOpenStart(false);
                      }}
                    >
                      {station.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Label>End Station</Label>
        <Popover open={openEnd} onOpenChange={setOpenEnd}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openEnd}
              className="w-full justify-between"
            >
              {endStation ? endStation.label : "Select end station..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search station..." />
              <CommandList>
                <CommandEmpty>No station found.</CommandEmpty>
                <CommandGroup>
                  {stationList.map((station) => (
                    <CommandItem
                      key={station.value}
                      value={station.label}
                      onSelect={(currentValue) => {
                        setEndStation(
                          stationList.find((s) => s.label.toLowerCase() === currentValue.toLowerCase())
                        );
                        setOpenEnd(false);
                      }}
                    >
                      {station.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch}>Find Path</Button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default TransportDirectionForm;
