import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink } from "lucide-react";
import { useYouTubeSearch, YouTubeVideo } from "@/hooks/useYouTubeSearch";
import { Trick } from "@/hooks/useTricksGeneration";

interface YouTubeTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  trick: Trick | null;
}

const difficultyColors = {
  beginner: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
};

export function YouTubeTutorialModal({ isOpen, onClose, trick }: YouTubeTutorialModalProps) {
  const { videos, isLoading, error, searchVideos, reset } = useYouTubeSearch();
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    if (isOpen && trick) {
      reset();
      setSelectedVideo(null);
      searchVideos(trick.youtubeSearchQuery).then((results) => {
        if (results.length > 0) {
          setSelectedVideo(results[0]);
        }
      });
    }
  }, [isOpen, trick]);

  if (!trick) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl">{trick.name}</SheetTitle>
            <Badge variant="outline" className={difficultyColors[trick.difficulty]}>
              {trick.difficulty}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{trick.description}</p>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Finding tutorials...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load videos. Please try again.</p>
          </div>
        )}

        {!isLoading && videos.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tutorials found for this trick.</p>
          </div>
        )}

        {selectedVideo && (
          <div className="mb-6">
            <div className="aspect-video rounded-lg overflow-hidden bg-black mb-3">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=0`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="flex items-start gap-3 mb-1">
              <h4 className="font-medium flex-1 min-w-0">{selectedVideo.title}</h4>
              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-primary hover:underline text-sm flex-shrink-0 whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </a>
            </div>
            <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
          </div>
        )}

        {videos.length > 1 && (
          <div>
            <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              More Tutorials
            </h4>
            <div className="space-y-3">
              {videos
                .filter((v) => v.videoId !== selectedVideo?.videoId)
                .map((video) => (
                  <button
                    key={video.videoId}
                    onClick={() => setSelectedVideo(video)}
                    className="flex gap-3 w-full text-left hover:bg-accent/50 rounded-lg p-2 transition-colors"
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-14 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

      </SheetContent>
    </Sheet>
  );
}
