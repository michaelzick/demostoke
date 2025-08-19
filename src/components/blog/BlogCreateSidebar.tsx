import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { AlertCircle, CheckCircle, TrendingUp, Eye, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { getContentStats } from "@/utils/textExtraction";

interface SEOAnalysis {
  overall_score: number;
  title_score: number;
  excerpt_score: number;
  content_score: number;
  suggestions: string[];
  title_analysis: string;
  excerpt_analysis: string;
  content_analysis: string;
}

interface BlogCreateSidebarProps {
  title: string;
  excerpt: string;
  content: string;
  category: string;
}

export function BlogCreateSidebar({ title, excerpt, content, category }: BlogCreateSidebarProps) {
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const previousIsMobileRef = useRef(isMobile);

  const closeSidebar = () => {
    setOpenMobile(false);
  };

  // Reset sidebar visibility when switching from mobile to desktop
  useEffect(() => {
    const wasMobile = previousIsMobileRef.current;
    const isNowDesktop = !isMobile;
    
    if (wasMobile && isNowDesktop) {
      setOpen(true);
      setOpenMobile(false);
    }
    
    previousIsMobileRef.current = isMobile;
  }, [isMobile, setOpen, setOpenMobile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  const analyzeSEO = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please add title and content before analyzing SEO.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-blog-seo', {
        body: {
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category: category
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setSeoAnalysis(data);
        toast.success("SEO analysis completed!");
      } else {
        throw new Error(data?.error || "Analysis failed");
      }
    } catch (error) {
      console.error("SEO analysis error:", error);
      toast.error("Failed to analyze SEO. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze = title.trim() && content.trim();

  const hasAnalysis = !!seoAnalysis;

  const bottomPadding = isMobile
    ? hasAnalysis
      ? "120px"
      : "80px"
    : hasAnalysis
    ? "120px"
    : "24px";

  return (
    <Sidebar className="top-20 h-[calc(100vh-5rem)]">
      <SidebarHeader className="p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          SEO Analysis
        </h2>
        <p className="text-sm text-muted-foreground">
          Optimize your content for better search rankings
        </p>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-6 space-y-6" style={{ paddingBottom: bottomPadding }}>
          {/* Analyze Button */}
          <Button 
            onClick={analyzeSEO}
            disabled={!canAnalyze || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Analyze SEO
              </>
            )}
          </Button>

          {!canAnalyze && (
            <p className="text-xs text-muted-foreground text-center">
              Add title and content to enable SEO analysis
            </p>
          )}

          {/* Overall Score */}
          {seoAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Overall SEO Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(seoAnalysis.overall_score)}`}>
                    {seoAnalysis.overall_score}/100
                  </div>
                  <Badge variant={getScoreBadgeVariant(seoAnalysis.overall_score)} className="mt-1">
                    {seoAnalysis.overall_score >= 80 ? "Excellent" :
                     seoAnalysis.overall_score >= 50 ? "Good" : "Needs Work"}
                  </Badge>
                </div>
                <Progress 
                  value={seoAnalysis.overall_score} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          )}

          {/* Individual Scores */}
          {seoAnalysis && (
            <div className="space-y-3">
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Title</span>
                  <Badge variant={getScoreBadgeVariant(seoAnalysis.title_score)} className="text-xs">
                    {seoAnalysis.title_score}/100
                  </Badge>
                </div>
                <Progress value={seoAnalysis.title_score} className="h-1.5" />
                {seoAnalysis.title_analysis && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {seoAnalysis.title_analysis}
                  </p>
                )}
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Excerpt</span>
                  <Badge variant={getScoreBadgeVariant(seoAnalysis.excerpt_score)} className="text-xs">
                    {seoAnalysis.excerpt_score}/100
                  </Badge>
                </div>
                <Progress value={seoAnalysis.excerpt_score} className="h-1.5" />
                {seoAnalysis.excerpt_analysis && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {seoAnalysis.excerpt_analysis}
                  </p>
                )}
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Content</span>
                  <Badge variant={getScoreBadgeVariant(seoAnalysis.content_score)} className="text-xs">
                    {seoAnalysis.content_score}/100
                  </Badge>
                </div>
                <Progress value={seoAnalysis.content_score} className="h-1.5" />
                {seoAnalysis.content_analysis && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {seoAnalysis.content_analysis}
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* SEO Suggestions */}
          {seoAnalysis && seoAnalysis.suggestions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {seoAnalysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Content Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Title Length:</span>
                <span className={title.length > 60 ? "text-red-500" : title.length >= 50 ? "text-green-500" : "text-amber-500"}>
                  {title.length} chars
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Excerpt Length:</span>
                <span className={excerpt.length > 160 ? "text-red-500" : excerpt.length >= 150 ? "text-green-500" : "text-amber-500"}>
                  {excerpt.length} chars
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Word Count:</span>
                <span className={getContentStats(content).wordCount >= 1500 ? "text-green-500" : getContentStats(content).wordCount >= 1000 ? "text-amber-500" : "text-red-500"}>
                  {getContentStats(content).wordCount} words
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Reading Time:</span>
                <span>{getContentStats(content).readingTime} min</span>
              </div>
            </CardContent>
          </Card>

          {/* SEO Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                SEO Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include target keywords in title and first paragraph</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use header tags (H2, H3) to structure content</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></div>
                  <span>Aim for 1500+ words for comprehensive coverage</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include relevant internal and external links</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0"></div>
                  <span>Optimize for featured snippets and voice search</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarContent>

      {(isMobile || hasAnalysis) && (
        <div
          className="fixed bottom-0 left-0 p-6 bg-sidebar border-t space-y-2 z-10"
          style={{ width: 'var(--sidebar-width, 320px)' }}
        >
          {isMobile && (
            <Button onClick={closeSidebar} className="w-full">
              Close
            </Button>
          )}
        </div>
      )}
    </Sidebar>
  );
}