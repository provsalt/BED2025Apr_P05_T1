import { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import { Brain, Target, TrendingUp, Lightbulb, Activity, AlertCircle, CheckCircle2, Clock, Camera } from "lucide-react";

export const AIPredictions = ({ isAuthenticated }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Remove auto-loading effect
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //   fetchPredictions();
  // }, [isAuthenticated]);

  const fetchPredictions = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetcher('/nutrition/ai-predictions?days=7');
      setPredictions(data);
      setHasGenerated(true);
    } catch (err) {
      console.error('Failed to fetch AI predictions:', err);
      
      // Handle specific error cases
      if (err.message.includes('User not authenticated')) {
        setError('Please log in to view AI predictions');
      } else if (err.message.includes('Failed to fetch meal')) {
        setError('No nutrition data available yet. Upload some meals to get AI insights!');
      } else if (err.message.includes('Rate limit')) {
        setError('Too many requests. Please try again in a few minutes.');
      } else {
        setError('Unable to load AI predictions at the moment');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = () => {
    fetchPredictions();
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show initial state with generate button
  if (!hasGenerated && !loading && !error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-black p-2 rounded-full">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Nutrition Insights</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 mb-3 text-gray-300" />
          <div className="text-center">
            <h4 className="font-medium text-lg mb-2">Generate AI Insights</h4>
            <p className="text-gray-600 mb-4">Get personalized nutrition recommendations based on your meal data</p>
            <button
              onClick={generateInsights}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
            >
              <Brain className="h-4 w-4" />
              Generate Insights
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-black p-2 rounded-full">
            <Brain className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Nutrition Insights</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 text-gray-600">Analyzing your nutrition data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-black p-2 rounded-full">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Nutrition Insights</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 mb-3 text-gray-300" />
          <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
          {error.includes('No nutrition data') && (
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">Get started by uploading your first meal!</p>
              <a
                href="/nutrition"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition"
              >
                <Camera className="h-4 w-4" />
                Upload Meal
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!predictions) {
    return null;
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 rounded-full">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Nutrition Insights</h3>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
        >
          <Brain className="h-4 w-4" />
          {loading ? "Updating..." : "Refresh"}
        </button>
      </div>

      {/* Health Score & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Health Score</span>
          </div>
          <div className="text-2xl font-bold text-black">
            {predictions.insights?.healthScore || 0}/100
          </div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Daily Calorie Goal</span>
          </div>
          <div className="text-2xl font-bold text-black">
            {Math.round((predictions.predictions?.weeklyCalorieGoal || 0) / 7)}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      {predictions.predictions?.trendAnalysis && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trend Analysis
          </h4>
          <p className="text-sm text-gray-700">{predictions.predictions.trendAnalysis}</p>
        </div>
      )}

      {/* Balance Assessment */}
      {predictions.insights?.balanceAssessment && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Nutritional Balance
          </h4>
          <p className="text-sm text-gray-700">{predictions.insights.balanceAssessment}</p>
        </div>
      )}

      {/* Recommendations */}
      {predictions.recommendations && predictions.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Personalized Recommendations
          </h4>
          <div className="space-y-3">
            {predictions.recommendations.slice(0, 3).map((rec, index) => (
              <div 
                key={index} 
                className={`p-3 border rounded-lg ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  {getPriorityIcon(rec.priority)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        {rec.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {rec.suggestion}
                    </p>
                    <p className="text-xs text-gray-600">
                      {rec.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Areas */}
      {predictions.predictions?.improvementAreas && predictions.predictions.improvementAreas.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Focus Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {predictions.predictions.improvementAreas.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Source Info */}
      {predictions.dataAnalyzed && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Analysis based on {predictions.dataAnalyzed.daysOfData} days of data 
            ({predictions.dataAnalyzed.totalMeals} meals) • 
            Generated {new Date(predictions.dataAnalyzed.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};
