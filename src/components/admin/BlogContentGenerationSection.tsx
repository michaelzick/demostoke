import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { blogPosts } from "@/lib/blog";
import { slugify } from "@/utils/slugify";
import { generateBlogPost } from "@/services/blogPostGenerationService";
import { Sparkles } from "lucide-react";

const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

const BlogContentGenerationSection = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>(categories[0] || "");
  const [authorName, setAuthorName] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [useVideoThumb, setUseVideoThumb] = useState(false);
  const [useVideoHero, setUseVideoHero] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await generateBlogPost({
        prompt,
        category,
        authorName,
        authorId: slugify(authorName),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnailUrl,
        heroImageUrl,
        videoUrl,
        useVideoThumbnail: useVideoThumb,
        useVideoHero,
        publishedAt,
      });
      toast({ title: "Blog post generated" });
    } catch (err) {
      console.error(err);
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate Blog Post
        </CardTitle>
        <CardDescription>
          Create blog content using an AI prompt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="author">Author Name</Label>
          <Input
            id="author"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumb">Thumbnail Image URL</Label>
          <Input
            id="thumb"
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero">Hero Image URL</Label>
          <Input
            id="hero"
            type="url"
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="video">YouTube Video URL</Label>
          <Input
            id="video"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useVideoThumb"
            checked={useVideoThumb}
            onCheckedChange={(checked) => setUseVideoThumb(checked as boolean)}
          />
          <Label htmlFor="useVideoThumb" className="text-sm">
            Use video thumbnail
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useVideoHero"
            checked={useVideoHero}
            onCheckedChange={(checked) => setUseVideoHero(checked as boolean)}
          />
          <Label htmlFor="useVideoHero" className="text-sm">
            Use video hero image
          </Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="published">Published On</Label>
          <Input
            id="published"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Blog Post
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogContentGenerationSection;
