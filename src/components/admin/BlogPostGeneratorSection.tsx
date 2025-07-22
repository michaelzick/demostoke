
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
import { generateBlogText } from "@/services/blog/generateBlogText";
import { blogService } from "@/services/blogService";

const BlogPostGeneratorSection = () => {
  const { toast } = useToast();
  const categories = [
    'snowboards',
    'skis',
    'surfboards',
    'mountain bikes',
    'gear reviews',
    'stories that stoke',
    'stories that suck'
  ];

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
  const [blogText, setBlogText] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [isTextGenerated, setIsTextGenerated] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isFormValid =
    category &&
    author.trim() &&
    tags.trim() &&
    thumbnail.trim() &&
    heroImage.trim() &&
    publishedDate &&
    blogText.trim() &&
    title.trim() &&
    excerpt.trim();

  const handleGenerateText = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a prompt to generate blog text.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingText(true);
    try {
      const result = await generateBlogText({
        prompt,
        category,
      });

      if (result.success && result.content) {
        setBlogText(result.content);
        setIsTextGenerated(true);
        toast({
          title: "Success",
          description: "Blog text has been generated successfully!",
        });
      } else {
        throw new Error(result.error || 'Failed to generate blog text');
      }
    } catch (error) {
      console.error('Error generating blog text:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate blog text.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleCreatePost = async () => {
    if (!isFormValid) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);
    const authorId = slugify(author);

    try {
      const result = await blogService.createPost({
        title,
        excerpt,
        content: blogText,
        category,
        author,
        authorId,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        thumbnail,
        heroImage,
        videoEmbed: youtubeUrl || undefined,
        publishedAt: (publishedDate ?? new Date()).toISOString(),
        readTime: Math.ceil(blogText.split(' ').length / 200), // Auto-generate read time based on text
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Blog post has been created and saved successfully! It will now appear in the blog section.",
        });

        // Reset form
        setPrompt("");
        setBlogText("");
        setTitle("");
        setExcerpt("");
        setIsTextGenerated(false);
        setAuthor("");
        setTags("");
        setThumbnail("");
        setHeroImage("");
        setYoutubeUrl("");
        setUseYoutubeThumb(false);
        setUseYoutubeHero(false);
        setPublishedDate(undefined);
      } else {
        throw new Error(result.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog post.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleTextChange = (value: string) => {
    setBlogText(value);
    // If user modifies the text, it's no longer purely AI-generated
    if (isTextGenerated && value !== blogText) {
      setIsTextGenerated(false);
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
            Prompt
          </Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Describe what you want the blog post to be about..."
          />
          <Button
            onClick={handleGenerateText}
            disabled={isGeneratingText || !prompt.trim()}
            className="flex items-center gap-2 mt-2"
          >
            {isGeneratingText ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGeneratingText ? "Generating..." : "Generate Text"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blogText">
            Text To Be Used <span className="text-red-500">*</span>
          </Label>
          {isTextGenerated && (
            <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>This content was generated by AI</span>
            </div>
          )}
          <Textarea
            id="blogText"
            value={blogText}
            onChange={(e) => handleTextChange(e.target.value)}
            rows={12}
            placeholder="Generated blog content will appear here, or you can write your own..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">
            Excerpt <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Brief description of the blog post..."
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
          <div className="block">
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {publishedDate ? format(publishedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={publishedDate}
                  onSelect={(date) => {
                    setPublishedDate(date);
                    setIsDatePickerOpen(false);
                  }}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button
          onClick={handleCreatePost}
          disabled={isCreatingPost || !isFormValid}
          className="flex items-center gap-2 w-auto"
        >
          {isCreatingPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isCreatingPost ? "Creating..." : "Create Blog Post"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogPostGeneratorSection;
