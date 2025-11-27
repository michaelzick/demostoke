import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/lib/blog/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, Eye, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function MyDraftsPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [drafts, setDrafts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
      return;
    }

    loadDrafts();
  }, [isAuthenticated, user]);

  const loadDrafts = async () => {
    if (!user?.id) return;

    setLoading(true);
    const userDrafts = await blogService.getDrafts(user.id);
    setDrafts(userDrafts);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedDraftId) return;

    const result = await blogService.deleteDraft(selectedDraftId);
    if (result.success) {
      toast.success("Draft deleted successfully");
      loadDrafts();
    } else {
      toast.error(result.error || "Failed to delete draft");
    }
    setDeleteDialogOpen(false);
    setSelectedDraftId(null);
  };

  const handlePublish = async () => {
    if (!selectedDraftId) return;

    const draft = drafts.find(d => d.id === selectedDraftId);
    if (!draft) return;

    // Calculate read time
    const wordCount = draft.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const result = await blogService.publishDraft(selectedDraftId, readTime);
    if (result.success) {
      toast.success("Draft published successfully!");
      loadDrafts();
    } else {
      toast.error(result.error || "Failed to publish draft");
    }
    setPublishDialogOpen(false);
    setSelectedDraftId(null);
  };

  const getStatusBadge = (post: BlogPost) => {
    const status = post.status || 'published';
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      scheduled: "default",
      archived: "outline",
      published: "default"
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading drafts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Drafts</h1>
          <p className="text-muted-foreground">Manage your blog post drafts</p>
        </div>
        <Button onClick={() => navigate("/blog/create")}>
          <FileText className="mr-2 h-4 w-4" />
          New Draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground mb-4">Start writing your first blog post</p>
            <Button onClick={() => navigate("/blog/create")}>Create Draft</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2">{draft.title}</h3>
                  {getStatusBadge(draft)}
                </div>
                {draft.category && (
                  <Badge variant="outline" className="w-fit">{draft.category}</Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {draft.excerpt || "No excerpt yet..."}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Last updated: {format(new Date(draft.publishedAt), "MMM d, yyyy 'at' h:mm a")}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/blog/edit/${draft.id}`)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/blog/preview/${draft.id}`)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    setSelectedDraftId(draft.id);
                    setPublishDialogOpen(true);
                  }}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setSelectedDraftId(draft.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this draft? It will be visible to all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
