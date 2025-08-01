import { TrendingUp, BarChart3 } from "lucide-react";

export const SimpleLineChart = ({ data = [], title = "Chart", height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mb-2 text-gray-300" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Check if all values are 0
  const hasData = data.some(d => d.value > 0);
  
  if (!hasData) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {title}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <TrendingUp className="h-12 w-12 mb-2 text-gray-300" />
          <p className="text-sm">No meals recorded yet</p>
          <p className="text-xs text-gray-400 mt-1">Start tracking your nutrition to see trends</p>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions and scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  
  const chartWidth = 500;
  const chartHeight = height - 60; // Account for padding
  const padding = 40;

  // Generate SVG path for the line
  const generatePath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Generate points for hover targets
  const generatePoints = () => {
    return data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((point.value - minValue) / valueRange) * (chartHeight - 2 * padding);
      return { x, y, ...point };
    });
  };

  const points = generatePoints();
  const path = generatePath();

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        {title}
      </h3>
      
      <div className="relative">
        <svg 
          width="100%" 
          height={height}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#000000" stopOpacity="0.01"/>
            </linearGradient>
          </defs>
          
          {/* Fill area under the line */}
          <path
            d={`${path} L ${points[points.length - 1]?.x},${chartHeight - padding} L ${points[0]?.x},${chartHeight - padding} Z`}
            fill="url(#lineGradient)"
          />
          
          {/* Main line */}
          <path
            d={path}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#000000"
                stroke="#ffffff"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              {/* Hover tooltip */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="25"
                  rx="4"
                  fill="#000000"
                  fillOpacity="0.9"
                />
                <text
                  x={point.x}
                  y={point.y - 20}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium"
                >
                  {point.value}
                </text>
              </g>
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-10">
          {data.map((point, index) => (
            <span key={index} className="text-xs text-gray-500">
              {point.label}
            </span>
          ))}
        </div>
      </div>
      
      {/* Summary stats */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Min: {minValue}</span>
        <span>Max: {maxValue}</span>
        <span>Avg: {Math.round(data.reduce((acc, d) => acc + d.value, 0) / data.length)}</span>
      </div>
    </div>
  );
};
