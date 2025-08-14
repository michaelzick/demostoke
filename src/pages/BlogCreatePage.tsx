import { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { generateBlogText } from "@/services/blog/generateBlogText";
import { blogService } from "@/services/blogService";
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { BlogCreateSidebar } from "@/components/blog/BlogCreateSidebar";
import BlogFooter from "@/components/BlogFooter";
import { cn } from "@/lib/utils";

const categories = [
  "snowboards", "skis", "surfboards", "mountain-bikes", "gear-reviews", "stories-that-stoke"
];

function BlogCreatePageInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();

  // For now, we'll just check if user exists - userRole check can be added later
  useEffect(() => {
    if (!user) {
      navigate('/auth/signin');
      return;
    }
  }, [user, navigate]);

  // Form state
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [publishedDate, setPublishedDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [useYoutubeThumbnail, setUseYoutubeThumbnail] = useState(false);
  const [useHeroImage, setUseHeroImage] = useState(false);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const handleGenerateText = async () => {
    if (!prompt.trim() || !category) {
      toast.error("Please provide a prompt and select a category.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBlogText({ prompt: prompt.trim(), category });

      if (result.success && result.content && result.title && result.excerpt) {
        setContent(result.content);
        setTitle(result.title);
        setExcerpt(result.excerpt);
        toast.success("Blog content generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate blog content.");
      }
    } catch (error) {
      console.error("Error generating blog text:", error);
      toast.error("An unexpected error occurred while generating content.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    return (
      title.trim() &&
      excerpt.trim() &&
      content.trim() &&
      category &&
      author.trim() &&
      publishedDate
    );
  };

  const handleCreatePost = async () => {
    if (!isFormValid()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsCreating(true);
    try {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      const readTime = Math.ceil(content.split(' ').length / 200);

      const heroImg = imageUrl.trim();
      const thumbImg = thumbnailUrl.trim();
      const finalThumbnail = thumbImg || heroImg;
      const finalHeroImage = useHeroImage ? heroImg : finalThumbnail;

      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        author: author.trim(),
        authorId: user?.id || '',
        slug,
        readTime,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        heroImage: finalHeroImage,
        thumbnail: finalThumbnail,
        videoEmbed: youtubeUrl || '',
        publishedAt: publishedDate!.toISOString(),
      };

      await blogService.createPost(postData);
      setCreatedSlug(slug);
      toast.success("Blog post created successfully!");

      // Reset form
      setPrompt("");
      setCategory("");
      setAuthor("");
      setTags("");
      setImageUrl("");
      setThumbnailUrl("");
      setYoutubeUrl("");
      setPublishedDate(undefined);
      setTitle("");
      setExcerpt("");
      setContent("");
      setUseYoutubeThumbnail(false);
      setUseHeroImage(false);
    } catch (error) {
      console.error("Error creating blog post:", error);
      toast.error("Failed to create blog post. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full">
      <BlogCreateSidebar
        title={title}
        excerpt={excerpt}
        content={content}
        category={category}
      />

      <SidebarInset className="flex-1">
        <div className="flex flex-col min-h-screen">
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold">Create Blog Post</h1>
                <p className="text-sm text-muted-foreground">
                  Write and publish new blog content with SEO optimization
                </p>
              </div>

              {/* Mobile SEO Button */}
              <div className="mb-6 flex justify-center md:hidden">
                <Button variant="outline" className="gap-2" onClick={toggleSidebar}>
                  <TrendingUp className="h-4 w-4" />
                  Show SEO
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Blog Post Creator</CardTitle>
                  <CardDescription>
                    Generate AI-powered blog content and optimize it for SEO performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* AI Content Generation */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prompt">Content Prompt *</Label>
                        <Textarea
                          id="prompt"
                          placeholder="Describe what you want to write about..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end">
                          <Button 
                            onClick={handleGenerateText}
                            disabled={isGenerating || !prompt.trim() || !category}
                            className="w-full"
                          >
                            {isGenerating ? "Generating..." : "Generate Content"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Blog Post Content */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter blog post title"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {title.length}/60 characters (optimal: 50-60)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="excerpt">Excerpt *</Label>
                        <Textarea
                          id="excerpt"
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Brief description of the post"
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {excerpt.length}/160 characters (optimal: 150-160)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                          id="content"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Main blog post content"
                          className="min-h-[400px]"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {content.split(' ').length} words (recommended: 1500+)
                        </p>
                      </div>
                    </div>

                    {/* Post Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="author">Author *</Label>
                        <Input
                          id="author"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          placeholder="Author name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                          id="tags"
                          value={tags}
                          onChange={(e) => setTags(e.target.value)}
                          placeholder="Comma-separated tags"
                        />
                      </div>

                      <div>
                        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                        <Input
                          id="thumbnailUrl"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          placeholder="Thumbnail URL"
                        />
                      </div>

                      <div>
                        <Label htmlFor="imageUrl">Hero Image URL</Label>
                        <Input
                          id="imageUrl"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Image URL"
                        />
                      </div>

                      <div>
                        <Label htmlFor="youtubeUrl">YouTube Embed URL</Label>
                        <Input
                          id="youtubeUrl"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="YouTube embed URL"
                        />
                      </div>

                      <div>
                        <Label>Published Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !publishedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {publishedDate ? format(publishedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={publishedDate}
                              onSelect={setPublishedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Image Options */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useYoutubeThumbnail"
                          checked={useYoutubeThumbnail}
                          onCheckedChange={(checked) => setUseYoutubeThumbnail(checked === true)}
                        />
                        <Label htmlFor="useYoutubeThumbnail">Use YouTube thumbnail as post thumbnail</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useHeroImage"
                          checked={useHeroImage}
                          onCheckedChange={(checked) => setUseHeroImage(checked === true)}
                        />
                        <Label htmlFor="useHeroImage">Use separate hero image</Label>
                      </div>
                    </div>

                    {/* Create Button */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        onClick={handleCreatePost}
                        disabled={!isFormValid() || isCreating}
                        size="lg"
                      >
                        {isCreating ? "Creating..." : "Create Blog Post"}
                      </Button>
                      {createdSlug && (
                        <Button asChild variant="outline" size="lg">
                          <Link to={`/blog/${createdSlug}`}>View Blog Post</Link>
                        </Button>
                      )}
                     </div>
              </CardContent>
            </Card>
            </div>
          </div>
          <BlogFooter />
        </div>
      </SidebarInset>
    </div>
  );
}

export default function BlogCreatePage() {
  return (
    <SidebarProvider>
      <BlogCreatePageInner />
    </SidebarProvider>
  );
}