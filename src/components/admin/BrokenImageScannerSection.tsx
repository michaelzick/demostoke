import { useState } from "react";
import { useIsAdmin } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Search, ExternalLink, AlertTriangle, Loader2, ImageOff } from "lucide-react";

interface BrokenImage {
  imageId: string;
  imageUrl: string;
  equipmentId: string;
  gearName: string;
  gearSlug: string;
  category: string;
  totalImages: number;
  errorReason: string;
}

const BrokenImageScannerSection = () => {
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [brokenImages, setBrokenImages] = useState<BrokenImage[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress({ current: 0, total: 0 });
    setBrokenImages([]);
    setHasScanned(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use this feature.",
          variant: "destructive",
        });
        return;
      }

      const response = await supabase.functions.invoke("scan-broken-images", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to scan images");
      }

      const data = response.data;
      setBrokenImages(data.brokenImages || []);
      setScanProgress({ current: data.scanned, total: data.total });
      setHasScanned(true);

      toast({
        title: "Scan complete",
        description: `Found ${data.brokenImages?.length || 0} broken image URLs out of ${data.total} total images.`,
      });
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "An error occurred while scanning images.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteSingle = async (imageId: string) => {
    setDeletingIds((prev) => new Set(prev).add(imageId));

    try {
      const { error } = await supabase
        .from("equipment_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      setBrokenImages((prev) => prev.filter((img) => img.imageId !== imageId));
      toast({
        title: "Image URL removed",
        description: "The broken image URL has been removed from the database.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete image URL.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(imageId);
        return next;
      });
    }
  };

  const handleDeleteAll = async () => {
    if (brokenImages.length === 0) return;

    setIsDeletingAll(true);
    let successCount = 0;
    let failCount = 0;

    for (const img of brokenImages) {
      try {
        const { error } = await supabase
          .from("equipment_images")
          .delete()
          .eq("id", img.imageId);

        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      } catch {
        failCount++;
      }
    }

    setBrokenImages((prev) =>
      prev.filter((img) => {
        // Keep images that failed to delete
        return failCount > 0 && brokenImages.indexOf(img) >= successCount;
      })
    );

    if (failCount === 0) {
      setBrokenImages([]);
    }

    toast({
      title: "Batch delete complete",
      description: `Successfully removed ${successCount} broken URLs. ${failCount > 0 ? `${failCount} failed.` : ""}`,
      variant: failCount > 0 ? "destructive" : "default",
    });

    setIsDeletingAll(false);
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  if (isAdminLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You must be an admin to access this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageOff className="h-5 w-5" />
          Broken Image Scanner
        </CardTitle>
        <CardDescription>
          Scan all gear images to find and remove broken URLs that no longer load.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scan Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleScan}
            disabled={isScanning || isDeletingAll}
            className="gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Scan for Broken Images
              </>
            )}
          </Button>

          {brokenImages.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isScanning || isDeletingAll}
                  className="gap-2"
                >
                  {isDeletingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete All ({brokenImages.length})
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all broken URLs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {brokenImages.length} broken image URLs from the database.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll}>
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Progress Indicator */}
        {isScanning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Scanning images...</span>
              <span>Please wait</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Results Summary */}
        {hasScanned && !isScanning && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm">
              <strong>Scan Results:</strong> Found{" "}
              <span className={brokenImages.length > 0 ? "text-destructive font-semibold" : "text-primary font-semibold"}>
                {brokenImages.length} broken
              </span>{" "}
              out of {scanProgress.total} total image URLs.
            </p>
          </div>
        )}

        {/* Results Table */}
        {brokenImages.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gear Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Broken URL</TableHead>
                  <TableHead className="text-center">Total Images</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brokenImages.map((img) => (
                  <TableRow key={img.imageId}>
                    <TableCell>
                      {img.gearName === "[Orphaned - Equipment Deleted]" ? (
                        <span className="text-muted-foreground italic">
                          {img.gearName}
                        </span>
                      ) : (
                        <a
                          href={`/gear/${img.gearSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          {img.gearName}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{img.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={img.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground hover:underline break-all"
                        title={img.imageUrl}
                      >
                        {truncateUrl(img.imageUrl)}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={img.totalImages <= 1 ? "destructive" : "outline"}
                      >
                        {img.totalImages}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-destructive">
                        {img.errorReason}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSingle(img.imageId)}
                        disabled={deletingIds.has(img.imageId) || isDeletingAll}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        {deletingIds.has(img.imageId) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Empty State */}
        {hasScanned && !isScanning && brokenImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">All images are working!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              No broken image URLs were found in the database.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrokenImageScannerSection;
