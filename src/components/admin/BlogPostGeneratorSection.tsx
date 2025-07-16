import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { blogPosts } from "@/lib/blog";
import { slugify } from "@/utils/slugify";
import { format } from "date-fns";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { generateBlogPost } from "@/services/blog/generateBlogPost";

const BlogPostGeneratorSection = () => {
  const { toast } = useToast();
  const categories = Array.from(new Set(blogPosts.map((p) => p.category)));

  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState<string>(categories[0] || "");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [useYoutubeThumb, setUseYoutubeThumb] = useState(false);
  const [useYoutubeHero, setUseYoutubeHero] = useState(false);
  const [publishedDate, setPublishedDate] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  const isFormValid =
    prompt.trim() &&
    category &&
    author.trim() &&
    tags.trim() &&
    thumbnail.trim() &&
    heroImage.trim() &&
    publishedDate;

  const handleGenerate = async () => {
    if (!prompt.trim() || !author.trim()) {
      toast({
        title: "Missing Fields",
        description: "Prompt and author are required.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const authorId = slugify(author);
    const result = await generateBlogPost({
      prompt,
      category,
      author,
      authorId,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      thumbnail,
      heroImage,
      youtubeUrl,
      useYoutubeThumbnail: useYoutubeThumb,
      useYoutubeHero,
      publishedAt: (publishedDate ?? new Date()).toISOString(),
    });
    setIsGenerating(false);

    if (result) {
      toast({ title: "Blog Post Generated", description: "Check your CMS for the new post." });
    } else {
      toast({ title: "Error", description: "Failed to generate blog post.", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Blog Post</CardTitle>
        <CardDescription>Create a new blog post using AI-generated content.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">
            Prompt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
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
          <Label htmlFor="author">
            Author Name <span className="text-red-500">*</span>
          </Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">
            Tags (comma separated) <span className="text-red-500">*</span>
          </Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumb">
            Thumbnail Image URL <span className="text-red-500">*</span>
          </Label>
          <Input id="thumb" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero">
            Hero Image URL <span className="text-red-500">*</span>
          </Label>
          <Input id="hero" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube Video URL</Label>
          <Input id="youtube" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox id="use-thumb" checked={useYoutubeThumb} onCheckedChange={(c) => setUseYoutubeThumb(!!c)} />
            <Label htmlFor="use-thumb">Use YouTube thumbnail</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="use-hero" checked={useYoutubeHero} onCheckedChange={(c) => setUseYoutubeHero(!!c)} />
            <Label htmlFor="use-hero">Use YouTube hero image</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>
            Published Date <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {publishedDate ? format(publishedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={publishedDate} onSelect={setPublishedDate} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !isFormValid}
          className="flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate Blog Post"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogPostGeneratorSection;
