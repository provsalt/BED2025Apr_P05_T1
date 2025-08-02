import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Sparkles, Target, TrendingUp, Zap, Heart, 
  CheckCircle2, AlertCircle, Clock, Camera, RefreshCw, Trophy
} from "lucide-react";
import { useAIPredictions } from "@/hooks/useNutrition";

export const AIPredictions = ({ isAuthenticated }) => {
  const { predictions, loading, error, hasGenerated, fetchPredictions } = useAIPredictions();

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
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-xl text-black">
            AI Nutrition Insights
          </CardTitle>
          <CardDescription className="text-base">
            Get personalized nutrition recommendations powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <Sparkles className="h-6 w-6 text-black" />
                <span>Personalized analysis of your eating patterns</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Target className="h-6 w-6 text-black" />
                <span>Smart recommendations based on your goals</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6 text-black" />
                <span>Track your nutritional progress over time</span>
              </div>
            </div>
            <Button 
              onClick={generateInsights}
              size="lg"
              className="bg-primary hover:bg-gray-800 text-white"
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
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white animate-pulse" />
            </div>
            <CardTitle className="text-black">
              AI Nutrition Insights
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="h-6 w-6 text-black" />
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
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-black">
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
    if (score >= 80) return "text-black";
    if (score >= 60) return "text-gray-700";
    return "text-gray-500";
  };

  const getHealthScoreGradient = (score) => {
    if (score >= 80) return "from-black to-gray-800";
    if (score >= 60) return "from-gray-700 to-gray-900";
    return "from-gray-500 to-gray-700";
  };

  const healthScore = predictions.insights?.healthScore || 0;
  const dailyCalorieGoal = Math.round((predictions.predictions?.weeklyCalorieGoal || 0) / 7);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-black">
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
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Trophy className="h-4 w-4 text-black" />
                    <span>Health Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${getHealthScoreGradient(healthScore)} flex items-center justify-center`}>
                      <span className="text-lg font-bold text-white">{healthScore}</span>
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${getHealthScoreColor(healthScore)}`}>
                        {healthScore}/100
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {healthScore >= 80 ? "Excellent!" : healthScore >= 60 ? "Good progress" : "Room for improvement"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Target className="h-4 w-4 text-black" />
                    <span>Daily Calorie Goal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-black">
                        {dailyCalorieGoal}
                      </p>
                      <p className="text-xs text-muted-foreground">calories per day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance Assessment */}
            {predictions.insights?.balanceAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Heart className="h-4 w-4 text-black" />
                    <span>Nutritional Balance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {predictions.insights.balanceAssessment}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Improvement Areas */}
            {predictions.predictions?.improvementAreas && predictions.predictions.improvementAreas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <Target className="h-4 w-4 text-black" />
                    <span>Focus Areas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {predictions.predictions.improvementAreas.map((area, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-black text-xs rounded-full border border-gray-200"
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
                    rec.priority === 'high' ? 'border-red-200 bg-red-50/30' :
                    rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50/30' :
                    'border-green-200 bg-green-50/30'
                  }`}>
                    <CardContent className="pt-3">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getPriorityIcon(rec.priority)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {rec.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority} priority
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {rec.suggestion}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
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
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <TrendingUp className="h-4 w-4 text-black" />
                    <span>Trend Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
                  <CardTitle className="text-base">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <div className="text-xl font-bold text-black">
                        {predictions.dataAnalyzed.daysOfData}
                      </div>
                      <div className="text-muted-foreground">Days analyzed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-black">
                        {predictions.dataAnalyzed.totalMeals}
                      </div>
                      <div className="text-muted-foreground">Meals processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base font-medium text-black">
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
