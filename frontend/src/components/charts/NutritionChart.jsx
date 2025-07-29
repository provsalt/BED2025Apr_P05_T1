"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
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
import { fetcher } from "@/lib/fetcher"

const chartConfig = {
  calories: {
    label: "Calories",
    color: "hsl(var(--chart-1))",
  },
  protein: {
    label: "Protein (g)",
    color: "hsl(var(--chart-2))",
  },
  carbs: {
    label: "Carbs (g)",
    color: "hsl(var(--chart-3))",
  },
  fat: {
    label: "Fat (g)",
    color: "hsl(var(--chart-4))",
  },
}

export function NutritionChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNutritionData()
  }, [])

  const fetchNutritionData = async () => {
    try {
      setLoading(true)
      const response = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/analytics/daily?days=7`)
      
      // Transform the data for the chart
      const transformedData = response.breakdown?.map((day, index) => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: day.date, // Keep original date for sorting
        calories: Math.round(day.calories || 0),
        protein: Math.round(day.protein || 0),
        carbs: Math.round(day.carbohydrates || day.carbs || 0), // Backend uses 'carbohydrates'
        fat: Math.round(day.fat || 0)
      })) || []

      // Sort by date from earliest to latest
      transformedData.sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // Remove the temporary date field
      transformedData.forEach(item => delete item.date)

      setChartData(transformedData)
    } catch (err) {
      console.error('Failed to fetch nutrition data:', err)
      setError(err.message)
      // Fallback sample data
      setChartData([
        { day: "Mon", calories: 1800, protein: 85, carbs: 200, fat: 60 },
        { day: "Tue", calories: 1900, protein: 88, carbs: 210, fat: 62 },
        { day: "Wed", calories: 1750, protein: 82, carbs: 195, fat: 58 },
        { day: "Thu", calories: 2000, protein: 95, carbs: 220, fat: 65 },
        { day: "Fri", calories: 1850, protein: 87, carbs: 205, fat: 61 },
        { day: "Sat", calories: 1950, protein: 90, carbs: 215, fat: 63 },
        { day: "Sun", calories: 1800, protein: 85, carbs: 200, fat: 60 },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Nutrition Overview</CardTitle>
          <CardDescription>Loading your nutrition data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Nutrition Overview</CardTitle>
        <CardDescription>
          Your daily intake for calories, protein, carbs, and fat over the last 7 days
          {error && <span className="text-destructive block text-sm mt-1">Using sample data due to: {error}</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="calories" fill="var(--color-calories)" radius={4} />
            <Bar dataKey="protein" fill="var(--color-protein)" radius={4} />
            <Bar dataKey="carbs" fill="var(--color-carbs)" radius={4} />
            <Bar dataKey="fat" fill="var(--color-fat)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
