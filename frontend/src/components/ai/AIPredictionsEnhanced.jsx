import { useState, useEffect } from "react";
import { fetcher } from "@/lib/fetcher";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Camera,
  Sparkles,
  Zap,
  Heart,
  Trophy,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AIPredictionsEnhanced = ({ isAuthenticated }) => {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

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

  // Initial state - Generate insights prompt
  if (!hasGenerated && !loading && !error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Nutrition Insights
          </CardTitle>
          <CardDescription className="text-lg">
            Get personalized nutrition recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <Sparkles className="h-8 w-8 text-purple-500" />
                <span>Personalized analysis of your eating patterns</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Target className="h-8 w-8 text-blue-500" />
                <span>Smart recommendations based on your goals</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <span>Track your nutritional progress over time</span>
              </div>
            </div>
            <Button 
              onClick={generateInsights}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Brain className="mr-2 h-5 w-5" />
              Generate AI Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white animate-pulse" />
            </div>
            <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Nutrition Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Analyzing your nutrition data...</p>
              <p className="text-sm text-muted-foreground">This may take a few moments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Nutrition Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          {error.includes('No nutrition data') && (
            <div className="mt-6 text-center space-y-4">
              <div className="space-y-2">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Get started by uploading your first meal!</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/nutrition">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Meal
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
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

  const getHealthScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthScoreGradient = (score) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const healthScore = predictions.insights?.healthScore || 0;
  const dailyCalorieGoal = Math.round((predictions.predictions?.weeklyCalorieGoal || 0) / 7);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Nutrition Insights
              </CardTitle>
              <CardDescription>
                Powered by advanced AI analysis
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Updating..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Health Score & Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Health Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className={`relative w-16 h-16 rounded-full bg-gradient-to-br ${getHealthScoreGradient(healthScore)} flex items-center justify-center`}>
                      <span className="text-2xl font-bold text-white">{healthScore}</span>
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                        {healthScore}/100
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {healthScore >= 80 ? "Excellent!" : healthScore >= 60 ? "Good progress" : "Room for improvement"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Target className="h-5 w-5 text-blue-500" />
                    <span>Daily Calorie Goal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {dailyCalorieGoal}
                      </p>
                      <p className="text-sm text-muted-foreground">calories per day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance Assessment */}
            {predictions.insights?.balanceAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Nutritional Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {predictions.insights.balanceAssessment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Improvement Areas */}
            {predictions.predictions?.improvementAreas && predictions.predictions.improvementAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    <span>Focus Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {predictions.predictions.improvementAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm rounded-full border border-purple-200"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {predictions.recommendations && predictions.recommendations.length > 0 ? (
              <div className="space-y-4">
                {predictions.recommendations.slice(0, 6).map((rec, index) => (
                  <Card key={index} className={`transition-all hover:shadow-md ${
                    rec.priority === 'high' ? 'border-red-200 bg-red-50/50' :
                    rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50/50' :
                    'border-green-200 bg-green-50/50'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getPriorityIcon(rec.priority)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {rec.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground">
                            {rec.suggestion}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rec.reasoning}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No specific recommendations available yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Trend Analysis */}
            {predictions.predictions?.trendAnalysis ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Trend Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {predictions.predictions.trendAnalysis}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Not enough data for trend analysis yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">Keep logging your meals to see trends!</p>
                </CardContent>
              </Card>
            )}

            {/* Data Source Info */}
            {predictions.dataAnalyzed && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {predictions.dataAnalyzed.daysOfData}
                      </div>
                      <div className="text-muted-foreground">Days analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {predictions.dataAnalyzed.totalMeals}
                      </div>
                      <div className="text-muted-foreground">Meals processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-purple-600">
                        {new Date(predictions.dataAnalyzed.generatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-muted-foreground">Last updated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
