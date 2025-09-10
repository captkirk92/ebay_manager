import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Search, AlertTriangle, TrendingUp, Edit, DollarSign, Eye } from "lucide-react";

export function ListingsOptimization() {
  const listingIssues = [
    {
      id: "LST-001",
      title: "iPhone 15 Pro Max Blue 256GB Unlocked",
      issue: "Title too short - missing keywords",
      severity: "high",
      currentScore: 45,
      potentialScore: 78,
      suggestions: ["Add 'Smartphone'", "Include 'Apple'", "Add condition details"],
      currentPrice: "$1,199",
      suggestedPrice: "$1,299",
      competition: 12,
      views: 89,
      watchers: 15
    },
    {
      id: "LST-002", 
      title: "Vintage Nike Air Jordan 1985 Sneakers",
      issue: "Missing size and color in title",
      severity: "medium",
      currentScore: 62,
      potentialScore: 85,
      suggestions: ["Add shoe size", "Specify colorway", "Include 'OG' or 'Retro'"],
      currentPrice: "$450",
      suggestedPrice: "$495",
      competition: 8,
      views: 156,
      watchers: 28
    },
    {
      id: "LST-003",
      title: "Gaming Laptop High Performance Computer",
      issue: "Vague description - needs specifics",
      severity: "high",
      currentScore: 38,
      potentialScore: 82,
      suggestions: ["Add brand name", "Include CPU/GPU specs", "Mention RAM size"],
      currentPrice: "$2,800",
      suggestedPrice: "$2,950",
      competition: 15,
      views: 67,
      watchers: 8
    }
  ];

  const optimizationStats = [
    {
      title: "Listings Needing Work",
      count: 15,
      icon: AlertTriangle,
      color: "text-orange-600",
      description: "Critical optimizations needed"
    },
    {
      title: "Avg Optimization Score",
      count: "62%",
      icon: TrendingUp,
      color: "text-blue-600", 
      description: "Target: 80%+"
    },
    {
      title: "Potential Revenue Increase",
      count: "$2,340",
      icon: DollarSign,
      color: "text-green-600",
      description: "From price optimization"
    },
    {
      title: "Low Visibility Items",
      count: 23,
      icon: Eye,
      color: "text-purple-600",
      description: "Need SEO improvements"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Optimization Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {optimizationStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`size-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Listings Optimization Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings Needing Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="high">High Priority</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="seo">SEO Issues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Potential</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listingIssues.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{listing.title}</div>
                          <div className="text-xs text-muted-foreground">ID: {listing.id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">{listing.issue}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(listing.severity)}>
                          {listing.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(listing.currentScore)}`}>
                            {listing.currentScore}%
                          </span>
                          <Progress value={listing.currentScore} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-bold text-green-600">{listing.potentialScore}%</span>
                          <div className="text-xs text-muted-foreground">
                            +{listing.potentialScore - listing.currentScore} pts
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>{listing.views} views</div>
                          <div>{listing.watchers} watchers</div>
                          <div>{listing.competition} competitors</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" className="text-xs">
                            <Edit className="size-3 mr-1" />
                            Fix
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            Preview
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="high">
              <div className="text-center py-8 text-muted-foreground">
                High priority optimization items will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="pricing">
              <div className="text-center py-8 text-muted-foreground">
                Pricing optimization suggestions will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="seo">
              <div className="text-center py-8 text-muted-foreground">
                SEO improvement recommendations will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Optimization View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Title Optimization</div>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">Current:</div>
                <div className="font-mono bg-muted p-2 rounded">{listingIssues[0].title}</div>
                <div className="text-muted-foreground">Suggested:</div>
                <div className="font-mono bg-green-50 p-2 rounded border border-green-200">
                  Apple iPhone 15 Pro Max Blue 256GB Unlocked Smartphone - Excellent Condition
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {listingIssues[0].suggestions.map((suggestion, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Pricing Analysis</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span className="font-bold">{listingIssues[0].currentPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Suggested Price:</span>
                  <span className="font-bold text-green-600">{listingIssues[0].suggestedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Average:</span>
                  <span>$1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Competition Level:</span>
                  <Badge variant="secondary">{listingIssues[0].competition} listings</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Optimization Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start">
                <Search className="size-4 mr-2" />
                Auto-Generate SEO Keywords
              </Button>
              <Button variant="outline" className="justify-start">
                <DollarSign className="size-4 mr-2" />
                Bulk Price Optimization
              </Button>
              <Button variant="outline" className="justify-start">
                <Edit className="size-4 mr-2" />
                Batch Edit Descriptions
              </Button>
              <Button variant="outline" className="justify-start">
                <TrendingUp className="size-4 mr-2" />
                Competitor Analysis
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Optimization Available</h4>
              <p className="text-sm text-blue-800 mb-3">
                Let our AI automatically optimize all your listings based on eBay best practices and market data.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start AI Optimization
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Optimization Schedule</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Daily: Price monitoring</div>
                <div>• Weekly: Keyword analysis</div>
                <div>• Monthly: Full listing audit</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}