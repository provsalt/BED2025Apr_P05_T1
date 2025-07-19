import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAlert } from "@/provider/AlertProvider";
import { fetcher } from "@/lib/fetcher.js";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  startStation: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine(val => val !== null, "Start station is required"),
  endStation: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine(val => val !== null, "End station is required"),
}).refine(data => data.startStation?.value !== data.endStation?.value, {
  message: "Start and end stations cannot be the same",
  path: ["endStation"],
});

const RouteForm = ({ initialData = null, onSubmit, isLoading = false, submitButtonText = "Submit" }) => {
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const [stations, setStations] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      startStation: null,
      endStation: null,
    },
  });

  const watchedStartStation = watch("startStation");
  const watchedEndStation = watch("endStation");

  useEffect(() => {
    const loadStations = async () => {
      try {
        const stationsData = await fetcher("/transport/stations");
        setStations(stationsData.codeNameMap);
      } catch (error) {
        console.error("Error loading stations:", error);
        showAlert("Failed to load stations.", "error");
      }
    };

    loadStations();
  }, [showAlert]);

  useEffect(() => {
    if (initialData && stations) {
      const stationList = Object.keys(stations).map(key => ({
        value: key,
        label: stations[key],
      }));
      
      const startStation = stationList.find(s => s.value === initialData.startLocation);
      const endStation = stationList.find(s => s.value === initialData.endLocation);
      
      reset({
        name: initialData.name,
        startStation: startStation || null,
        endStation: endStation || null,
      });
    }
  }, [initialData, stations, reset]);

  const stationList = stations ? Object.keys(stations).map(key => ({
    value: key,
    label: stations[key],
  })) : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-md px-8 pt-6 pb-8 mb-4 space-y-4">
      <div>
        <Label htmlFor="name">Route Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder="Enter route name"
              {...field}
              className={errors.name ? "border-red-500" : ""}
            />
          )}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label>Start Station</Label>
        <Controller
          name="startStation"
          control={control}
          render={() => (
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openStart}
                  className={`w-full justify-between ${errors.startStation ? "border-red-500" : ""}`}
                >
                  {watchedStartStation ? watchedStartStation.label : "Select start station..."}
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
                            const selectedStation = stationList.find((s) => s.label.toLowerCase() === currentValue.toLowerCase());
                            setValue("startStation", selectedStation);
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
          )}
        />
        {errors.startStation && (
          <p className="text-red-500 text-sm mt-1">{errors.startStation.message}</p>
        )}
      </div>

      <div>
        <Label>End Station</Label>
        <Controller
          name="endStation"
          control={control}
          render={() => (
            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEnd}
                  className={`w-full justify-between ${errors.endStation ? "border-red-500" : ""}`}
                >
                  {watchedEndStation ? watchedEndStation.label : "Select end station..."}
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
                            const selectedStation = stationList.find((s) => s.label.toLowerCase() === currentValue.toLowerCase());
                            setValue("endStation", selectedStation);
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
          )}
        />
        {errors.endStation && (
          <p className="text-red-500 text-sm mt-1">{errors.endStation.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitButtonText}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate("/transport")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default RouteForm;