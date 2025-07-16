import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { blogPosts } from "@/lib/blog";
import { slugify } from "@/utils/slugify";
import { generateBlogPost } from "@/services/blogAIService";

const BlogPostGenerationSection = () => {
  const { toast } = useToast();
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState(categories[0] || "");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [useYoutubeThumb, setUseYoutubeThumb] = useState(false);
  const [useYoutubeHero, setUseYoutubeHero] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate the blog post.",
        variant: "destructive",
      });
      return;
    }

    const authorId = slugify(author);
    setGenerating(true);
    try {
      await generateBlogPost({
        prompt,
        category,
        author,
        authorId,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        thumbnail,
        heroImage,
        youtubeUrl,
        useYoutubeThumbnail: useYoutubeThumb,
        useYoutubeHero,
        publishedAt,
      });
      toast({
        title: "Blog Post Generated",
        description: "Check the console or database for the new post.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate blog post.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Blog Post</CardTitle>
        <CardDescription>
          Use AI to generate a blog post from a prompt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-base">
            Prompt
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category" className="text-base">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="author" className="text-base">
            Author Name
          </Label>
          <Input
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-base">
            Tags (comma separated)
          </Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail" className="text-base">
            Thumbnail Image URL
          </Label>
          <Input
            id="thumbnail"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero" className="text-base">
            Hero Image URL
          </Label>
          <Input
            id="hero"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube" className="text-base">
            YouTube Video URL
          </Label>
          <Input
            id="youtube"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-youtube-thumb"
              checked={useYoutubeThumb}
              onCheckedChange={(checked) => setUseYoutubeThumb(!!checked)}
            />
            <Label htmlFor="use-youtube-thumb">Use YouTube Thumbnail</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="use-youtube-hero"
              checked={useYoutubeHero}
              onCheckedChange={(checked) => setUseYoutubeHero(!!checked)}
            />
            <Label htmlFor="use-youtube-hero">Use YouTube Hero Image</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="published" className="text-base">
            Published On
          </Label>
          <Input
            id="published"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Blog Post"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogPostGenerationSection;
