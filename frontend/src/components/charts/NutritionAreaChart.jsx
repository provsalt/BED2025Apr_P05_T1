"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetcher } from "@/lib/fetcher"

const chartConfig = {
  calories: {
    label: "Calories",
    color: "var(--chart-1)",
  },
  protein: {
    label: "Protein",
    color: "var(--chart-2)",
  },
}

export function NutritionAreaChart() {
  const [timeRange, setTimeRange] = React.useState("30d")
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    fetchNutritionData()
  }, [timeRange])

  const fetchNutritionData = async () => {
    try {
      setLoading(true)
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/daily?days=${days}`)
      
      console.log("=== NUTRITION API RESPONSE ===")
      console.log("Full response:", response)
      console.log("Breakdown array:", response.breakdown)
      console.log("Number of days returned:", response.breakdown?.length || 0)
      
      if (response.breakdown?.length > 0) {
        console.log("Sample day data:", response.breakdown[0])
        console.log("Date range:", {
          first: response.breakdown[0]?.date,
          last: response.breakdown[response.breakdown.length - 1]?.date
        })
      }
      
      // Transform the data for the chart
      const transformedData = response.breakdown?.map((day) => ({
        date: day.date,
        calories: Math.round(day.calories || 0),
        protein: Math.round(day.protein || 0),
        carbs: Math.round(day.carbohydrates || day.carbs || 0), // Backend uses 'carbohydrates'
        fat: Math.round(day.fat || 0)
      })) || []

      console.log("Transformed data:", transformedData)

      // Sort by date from earliest to latest
      transformedData.sort((a, b) => new Date(a.date) - new Date(b.date))

      console.log("Sorted data:", transformedData)

      setChartData(transformedData)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch nutrition data:', err)
      setError(err.message)
      // Fallback sample data with proper date format
      const fallbackData = []
      const today = new Date()
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        fallbackData.push({
          date: date.toISOString().split('T')[0],
          calories: Math.floor(Math.random() * 800) + 1200, // 1200-2000
          protein: Math.floor(Math.random() * 50) + 50, // 50-100
        })
      }
      setChartData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = React.useMemo(() => {
    return chartData
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Trends</CardTitle>
          <CardDescription>Loading your nutrition data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Nutrition Trends</CardTitle>
          <CardDescription>
            Your daily calories and protein intake over time
            {error && <span className="text-destructive block text-sm mt-1">Using sample data: {error}</span>}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-calories)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-calories)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillProtein" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-protein)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-protein)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="protein"
              type="natural"
              fill="url(#fillProtein)"
              stroke="var(--color-protein)"
              stackId="a"
            />
            <Area
              dataKey="calories"
              type="natural"
              fill="url(#fillCalories)"
              stroke="var(--color-calories)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
