import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Sparkles, Brain, Zap, Target, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";

export function AIInsightsPanel() {
  const aiInsights = [
    {
      id: 1,
      type: 'urgent',
      title: 'Critical Shipping Alert',
      description: '5 orders must ship today to avoid late defects',
      action: 'Generate shipping labels now',
      impact: 'Prevents negative feedback',
      confidence: 95,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-600/10 border-red-600/20'
    },
    {
      id: 2,
      type: 'opportunity',
      title: 'Revenue Optimization',
      description: '15 listings underpriced by average $23 each',
      action: 'Auto-optimize pricing',
      impact: '+$2,340 potential revenue',
      confidence: 88,
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-600/10 border-green-600/20'
    },
    {
      id: 3,
      type: 'seo',
      title: 'SEO Enhancement',
      description: '23 listings missing high-impact keywords',
      action: 'Optimize titles & descriptions',
      impact: '+40% visibility potential',
      confidence: 82,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/10 border-blue-600/20'
    },
    {
      id: 4,
      type: 'efficiency',
      title: 'Customer Service Automation',
      description: '7 messages can be auto-responded',
      action: 'Enable smart replies',
      impact: 'Save 2.5 hours daily',
      confidence: 91,
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/10 border-purple-600/20'
    }
  ];

  const aiStatus = {
    analysisComplete: 94,
    recommendationsGenerated: 12,
    issuesResolved: 8,
    optimizationsApplied: 5
  };

  return (
    <div className="space-y-6">
      {/* AI Status Overview */}
      <Card className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 border-blue-600/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="size-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                AI Analysis Engine
                <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-0">
                  ACTIVE
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Real-time store optimization in progress</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{aiStatus.analysisComplete}%</div>
              <div className="text-xs text-muted-foreground">Analysis Complete</div>
              <Progress value={aiStatus.analysisComplete} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{aiStatus.recommendationsGenerated}</div>
              <div className="text-xs text-muted-foreground">Recommendations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{aiStatus.issuesResolved}</div>
              <div className="text-xs text-muted-foreground">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{aiStatus.optimizationsApplied}</div>
              <div className="text-xs text-muted-foreground">Optimizations Applied</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiInsights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <Card key={insight.id} className={`${insight.bgColor} border transition-all hover:scale-[1.02] cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background/50 rounded-lg">
                      <IconComponent className={`size-5 ${insight.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-muted-foreground/30">
                          {insight.type.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Sparkles className="size-3 text-blue-400" />
                          <span className="text-xs text-muted-foreground">{insight.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Impact: </span>
                    <span className="font-medium text-foreground">{insight.impact}</span>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="size-4 mr-2" />
                  {insight.action}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Learning Progress */}
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="size-5 text-blue-400" />
            AI Learning & Adaptation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-400" />
                <span className="text-sm">Store patterns analyzed</span>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">Complete</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-400" />
                <span className="text-sm">Customer behavior mapped</span>
              </div>
              <Badge variant="secondary" className="bg-green-600/20 text-green-400">Complete</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Competitor analysis in progress</span>
              </div>
              <Badge variant="outline" className="border-blue-400/30 text-blue-400">Running</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm">Market trend prediction</span>
              </div>
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">Queued</Badge>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="size-4 text-purple-400" />
              <span className="text-sm font-medium">AI Recommendation</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on your store's performance patterns, I recommend implementing the pricing optimization first. 
              This will provide immediate revenue impact while I continue analyzing your customer service efficiency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}