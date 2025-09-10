import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Search,
  AlertTriangle,
  TrendingUp,
  Edit,
  DollarSign,
  Eye,
  Loader2,
} from "lucide-react";
import { useEbayData } from "../hooks/useEbayData";

interface ListingOptimization {
  id: string;
  title: string;
  issue: string;
  severity: "high" | "medium" | "low";
  currentScore: number;
  potentialScore: number;
  suggestions: string[];
  currentPrice: string;
  suggestedPrice: string;
  competition: number;
  views: number;
  watchers: number;
}

interface OptimizationStat {
  title: string;
  count: string | number;
  icon: any;
  color: string;
  description: string;
}

export function ListingsOptimization() {
  const {
    listings,
    isListingsLoading,
    listingsError,
    analytics,
    isAnalyticsLoading,
  } = useEbayData();
  const [listingOptimizations, setListingOptimizations] = useState<
    ListingOptimization[]
  >([]);
  const [optimizationStats, setOptimizationStats] = useState<
    OptimizationStat[]
  >([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analysis functions
  const analyzeTitleOptimization = (title: string) => {
    const issues = [];
    const suggestions = [];
    let score = 100;

    // Check title length (optimal: 60-80 characters)
    if (title.length < 60) {
      score -= 20;
      issues.push("Title too short - missing keywords");
      suggestions.push("Add relevant keywords", "Include condition details");
    }

    // Check for brand keywords
    const commonBrands = [
      "Apple",
      "Samsung",
      "Nike",
      "Sony",
      "Canon",
      "Dell",
      "HP",
      "Lenovo",
    ];
    const hasBrand = commonBrands.some((brand) =>
      title.toLowerCase().includes(brand.toLowerCase())
    );
    if (!hasBrand) {
      score -= 15;
      suggestions.push("Include brand name");
    }

    // Check for condition keywords
    const conditionWords = [
      "new",
      "used",
      "refurbished",
      "excellent",
      "mint",
      "like new",
    ];
    const hasCondition = conditionWords.some((word) =>
      title.toLowerCase().includes(word)
    );
    if (!hasCondition) {
      score -= 10;
      suggestions.push("Add condition details");
    }

    // Check for specific model/specs
    const hasSpecs = /\d+GB|\d+inch|\d+mp|Core\s*i\d|GTX|RTX/i.test(title);
    if (!hasSpecs) {
      score -= 15;
      suggestions.push("Include specific model/specs");
    }

    return {
      score: Math.max(0, score),
      issues: issues.length > 0 ? issues : ["Minor improvements possible"],
      suggestions,
    };
  };

  const analyzePricing = (currentPrice: string) => {
    const price = parseFloat(currentPrice.replace(/[^0-9.]/g, ""));
    const suggestedPrice = (price * 1.05).toFixed(2); // 5% markup suggestion

    return {
      suggestedPrice: `$${suggestedPrice}`,
      competition: Math.floor(Math.random() * 20) + 5, // Placeholder for competition data
    };
  };

  const getSeverityFromScore = (score: number): "high" | "medium" | "low" => {
    if (score < 50) return "high";
    if (score < 75) return "medium";
    return "low";
  };

  // Process real listings data for optimization analysis
  useEffect(() => {
    if (listings?.listings && !isListingsLoading) {
      setIsAnalyzing(true);

      const optimizations: ListingOptimization[] = listings.listings.map(
        (listing) => {
          const titleAnalysis = analyzeTitleOptimization(listing.Title);
          const pricingAnalysis = analyzePricing(listing.CurrentPrice);
          const severity = getSeverityFromScore(titleAnalysis.score);

          return {
            id: listing.ItemID,
            title: listing.Title,
            issue: titleAnalysis.issues[0] || "No major issues found",
            severity,
            currentScore: titleAnalysis.score,
            potentialScore: Math.min(100, titleAnalysis.score + 25),
            suggestions: titleAnalysis.suggestions,
            currentPrice: listing.CurrentPrice,
            suggestedPrice: pricingAnalysis.suggestedPrice,
            competition: pricingAnalysis.competition,
            views: Math.floor(Math.random() * 200) + 50, // Placeholder - needs real analytics
            watchers: Math.floor(Math.random() * 50) + 5, // Placeholder - needs real analytics
          };
        }
      );

      setListingOptimizations(optimizations);

      // Calculate optimization statistics
      const needsWork = optimizations.filter(
        (opt) => opt.severity === "high" || opt.severity === "medium"
      ).length;
      const avgScore =
        optimizations.length > 0
          ? Math.round(
              optimizations.reduce((sum, opt) => sum + opt.currentScore, 0) /
                optimizations.length
            )
          : 0;
      const potentialIncrease = optimizations.reduce((sum, opt) => {
        const current = parseFloat(opt.currentPrice.replace(/[^0-9.]/g, ""));
        const suggested = parseFloat(
          opt.suggestedPrice.replace(/[^0-9.]/g, "")
        );
        return sum + (suggested - current);
      }, 0);
      const lowVisibility = optimizations.filter(
        (opt) => opt.views < 100
      ).length;

      setOptimizationStats([
        {
          title: "Listings Needing Work",
          count: needsWork,
          icon: AlertTriangle,
          color: "text-orange-600",
          description: "Critical optimizations needed",
        },
        {
          title: "Avg Optimization Score",
          count: `${avgScore}%`,
          icon: TrendingUp,
          color: "text-blue-600",
          description: "Target: 80%+",
        },
        {
          title: "Potential Revenue Increase",
          count: `$${potentialIncrease.toFixed(0)}`,
          icon: DollarSign,
          color: "text-green-600",
          description: "From price optimization",
        },
        {
          title: "Low Visibility Items",
          count: lowVisibility,
          icon: Eye,
          color: "text-purple-600",
          description: "Need SEO improvements",
        },
      ]);

      setIsAnalyzing(false);
    }
  }, [listings, isListingsLoading]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  // Show loading state while analyzing or loading data
  if (isListingsLoading || isAnalyzing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <div className="text-lg font-medium">
              {isListingsLoading
                ? "Loading listings..."
                : "Analyzing listings for optimization opportunities..."}
            </div>
            <div className="text-sm text-muted-foreground">
              This may take a few moments
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (listingsError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
              <div className="text-lg font-medium">Unable to load listings</div>
              <div className="text-sm text-muted-foreground">
                {listingsError}
              </div>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state
  if (!listings?.listings || listings.listings.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <Search className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="text-lg font-medium">
                No active listings found
              </div>
              <div className="text-sm text-muted-foreground">
                Create some listings to see optimization recommendations
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
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
          <CardTitle>
            Listings Needing Optimization ({listingOptimizations.length} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                All Issues ({listingOptimizations.length})
              </TabsTrigger>
              <TabsTrigger value="high">
                High Priority (
                {
                  listingOptimizations.filter((l) => l.severity === "high")
                    .length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="pricing">
                Pricing (
                {
                  listingOptimizations.filter((l) =>
                    l.suggestions.some((s) => s.includes("price"))
                  ).length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="seo">
                SEO Issues (
                {listingOptimizations.filter((l) => l.currentScore < 75).length}
                )
              </TabsTrigger>
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
                  {listingOptimizations.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm max-w-xs truncate">
                            {listing.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {listing.id}
                          </div>
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
                          <span
                            className={`font-bold ${getScoreColor(
                              listing.currentScore
                            )}`}
                          >
                            {listing.currentScore}%
                          </span>
                          <Progress
                            value={listing.currentScore}
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-bold text-green-600">
                            {listing.potentialScore}%
                          </span>
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              window.open(
                                `https://www.ebay.com/itm/${listing.id}`,
                                "_blank"
                              )
                            }
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="high">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listingOptimizations
                    .filter((listing) => listing.severity === "high")
                    .map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>
                          <div className="font-medium text-sm max-w-xs truncate">
                            {listing.title}
                          </div>
                        </TableCell>
                        <TableCell>{listing.issue}</TableCell>
                        <TableCell>
                          <span
                            className={`font-bold ${getScoreColor(
                              listing.currentScore
                            )}`}
                          >
                            {listing.currentScore}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="text-xs">
                            <Edit className="size-3 mr-1" />
                            Fix Now
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="text-center py-8 text-muted-foreground">
                Pricing optimization suggestions based on current market data
                will appear here.
              </div>
            </TabsContent>

            <TabsContent value="seo">
              <div className="text-center py-8 text-muted-foreground">
                SEO improvement recommendations based on listing analysis will
                appear here.
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
                <div className="font-mono bg-muted p-2 rounded">
                  {listingOptimizations[0]?.title || "Sample listing title"}
                </div>
                <div className="text-muted-foreground">Suggested:</div>
                <div className="font-mono bg-green-50 p-2 rounded border border-green-200">
                  Apple iPhone 15 Pro Max Blue 256GB Unlocked Smartphone -
                  Excellent Condition
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(listingOptimizations[0]?.suggestions || []).map(
                    (suggestion, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {suggestion}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="font-medium mb-2">Pricing Analysis</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Price:</span>
                  <span className="font-bold">
                    {listingOptimizations[0]?.currentPrice || "$19.99"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Suggested Price:</span>
                  <span className="font-bold text-green-600">
                    {listingOptimizations[0]?.suggestedPrice || "$24.99"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Market Average:</span>
                  <span>$1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Competition Level:</span>
                  <Badge variant="secondary">
                    {listingOptimizations[0]?.competition || "47"} listings
                  </Badge>
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
              <h4 className="font-medium text-blue-900 mb-2">
                AI Optimization Available
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Let our AI automatically optimize all your listings based on
                eBay best practices and market data.
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
