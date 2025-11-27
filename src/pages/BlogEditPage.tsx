import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { blogService } from "@/services/blogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { format } from "date-fns";
import { BlogPost } from "@/lib/blog/types";
import BlogFooter from "@/components/BlogFooter";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BlogCreateSidebar } from "@/components/blog/BlogCreateSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { slugify } from "@/utils/slugify";

const categories = [
  "snowboards",
  "skis",
  "surfboards",
  "mountain bikes",
  "gear reviews",
  "stories that stoke",
  "stories that suck",
];

function BlogEditPageInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [lastManualSaved, setLastManualSaved] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    tags: [] as string[],
    heroImage: "",
    thumbnail: "",
    videoEmbed: ""
  });
  
  const [tagsString, setTagsString] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    loadDraft();
  }, [isAuthenticated, id]);

  const loadDraft = async () => {
    if (!id) {
      navigate("/blog/drafts");
      return;
    }

    const draft = await blogService.getDraftById(id);
    if (!draft) {
      toast.error("Draft not found");
      navigate("/blog/drafts");
      return;
    }

    setFormData({
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      category: draft.category,
      author: draft.author,
      tags: draft.tags,
      heroImage: draft.heroImage,
      thumbnail: draft.thumbnail,
      videoEmbed: draft.videoEmbed || ""
    });
    setTagsString(draft.tags.join(", "));
    setLoading(false);
  };

  const handleSaveDraft = async () => {
    if (!user?.id || !id) return;

    try {
      const result = await blogService.saveDraft({
        id,
        userId: user.id,
        ...formData,
        tags: tagsString.split(",").map(t => t.trim()).filter(Boolean),
        authorId: user.id
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to save draft");
      }
      
      setLastManualSaved(new Date());
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save draft");
      throw error;
    }
  };

  const { isSaving, lastSaved, error: autoSaveError } = useAutoSave({
    data: formData,
    onSave: handleSaveDraft,
    delay: 30000,
    enabled: !!user?.id && !!id && !loading
  });

  const handlePublish = async () => {
    if (!id) return;

    // Validate required fields
    if (!formData.title || formData.title.length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }
    if (!formData.excerpt || formData.excerpt.length < 50) {
      toast.error("Excerpt must be at least 50 characters");
      return;
    }
    if (!formData.content || formData.content.split(/\s+/).length < 100) {
      toast.error("Content must be at least 100 words");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setPublishing(true);

    // Save final version before publishing
    await handleSaveDraft();

    const wordCount = formData.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const slug = slugify(formData.title);

    const result = await blogService.publishDraft(id, readTime, formData.title);
    
    setPublishing(false);

    if (result.success) {
      toast.success("Blog post published successfully!");
      navigate(`/blog/${slug}`);
    } else {
      toast.error(result.error || "Failed to publish post");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Draft</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {!isSaving && (lastManualSaved || lastSaved) && (
                <span>Last saved: {format(
                  lastManualSaved && lastSaved 
                    ? (lastManualSaved > lastSaved ? lastManualSaved : lastSaved)
                    : lastManualSaved || lastSaved!, 
                  "h:mm a"
                )}</span>
              )}
              {autoSaveError && (
                <span className="text-destructive">Auto-save failed</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/blog/drafts")}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                try {
                  await handleSaveDraft();
                } catch (error) {
                  // Error already handled in handleSaveDraft
                }
              }} 
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Now
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Edit your blog post draft</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter blog post title (min 10 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary (min 50 characters)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Blog post content (min 100 words)"
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author Name</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="skiing, powder, gear review"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={formData.heroImage}
                onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoEmbed">YouTube Video Embed URL</Label>
              <Input
                id="videoEmbed"
                value={formData.videoEmbed}
                onChange={(e) => setFormData({ ...formData, videoEmbed: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <BlogFooter />
    </div>
  );
}

export default function BlogEditPage() {
  return (
    <SidebarProvider>
      <BlogEditPageInner />
    </SidebarProvider>
  );
}
