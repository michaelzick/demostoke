import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import { User, Calendar, Share2, ArrowUp, Edit, ArrowLeft, FileText } from "lucide-react";
import { blogService } from "@/services/blogService";
import { slugify } from "@/utils/slugify";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRelatedGear } from "@/hooks/useRelatedGear";
import RelatedGear from "@/components/equipment-detail/RelatedGear";
import ContentRenderer from "@/components/blog/ContentRenderer";
import { getPublishedBlogPost } from "@/lib/blog/publishedPost";
import { supabase } from "@/integrations/supabase/client";
import { useSsrPageData } from "@/contexts/SsrPageDataContext";
import { useIsAdmin } from "@/hooks/useUserRole";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  PUBLIC_SITE_URL,
  buildBlogPostTitle,
  humanizeSlug,
} from "@/lib/seo/publicMetadata";
import { ROBOTS_NOINDEX_FOLLOW } from "@/lib/seo/policy.js";
import {
  trackGeneratedGearReviewRelatedGearClick,
  trackGeneratedGearReviewView,
} from "@/utils/blogAnalytics";
import { trackEvent } from "@/utils/tracking";

const BlogPostPage = () => {
  const { slug, id } = useParams<{ slug?: string; id?: string; }>();
  const { blog: ssrBlog } = useSsrPageData();
  const isPreviewMode = Boolean(id);
  const { data: article, isLoading, isError, refetch } = useQuery({
    queryKey: ["blog-post", isPreviewMode ? "preview" : "published", id || slug],
    queryFn: ({ signal }) => id
      ? blogService.getDraftById(id)
      : getPublishedBlogPost(supabase, slug, signal),
    initialData: !isPreviewMode && ssrBlog && ssrBlog.slug === slug ? ssrBlog.post : undefined,
    // Preview access and content must be checked each time the route mounts.
    staleTime: isPreviewMode ? 0 : 60_000,
    gcTime: isPreviewMode ? 0 : undefined,
  });
  const { data: generatedMetadata } = useQuery({
    queryKey: ["published-blog-review-metadata", article?.databaseId],
    queryFn: async () => {
      const metadata = await blogService.getGeneratedGearReviewMetadataMap([article.databaseId]);
      return metadata.get(article.databaseId) ?? null;
    },
    enabled: !isPreviewMode && Boolean(article?.databaseId),
  });
  const post = useMemo(
    () => article && blogService.withGeneratedGearReviewMetadata(article, generatedMetadata),
    [article, generatedMetadata],
  );
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ["related-blog-posts", article?.id, article?.category],
    queryFn: ({ signal }) => blogService.getRelatedPublishedPosts(article, signal),
    enabled: !isPreviewMode && Boolean(article),
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const generatedReviewViewTrackedRef = useRef<string | null>(null);
  const notFoundTrackedRef = useRef<string | null>(null);
  const relatedGearUnavailableTrackedRef = useRef<string | null>(null);
  const { isAdmin } = useIsAdmin();
  const currentDocumentTitle =
    typeof document !== "undefined" ? document.title : undefined;
  const canonicalUrl = !isPreviewMode && post ? `${PUBLIC_SITE_URL}/blog/${encodeURIComponent(post.id)}` : undefined;
  const robots = isPreviewMode || (!isLoading && !isError && !post) ? ROBOTS_NOINDEX_FOLLOW : undefined;

  useEffect(() => {
    if (!post?.isGeneratedGearReview) {
      return;
    }

    const mode = isPreviewMode ? "draft_preview" : "published";
    const trackingKey = `${mode}:${post.databaseId || post.id}`;
    if (generatedReviewViewTrackedRef.current === trackingKey) {
      return;
    }

    generatedReviewViewTrackedRef.current = trackingKey;
    trackGeneratedGearReviewView(post, mode);
  }, [isPreviewMode, post]);

  useEffect(() => {
    if (isLoading || isError || post) {
      return;
    }

    const trackingKey = `${isPreviewMode ? "draft_preview" : "published"}:${slug || id || "unknown"}`;
    if (notFoundTrackedRef.current === trackingKey) {
      return;
    }

    notFoundTrackedRef.current = trackingKey;
    trackEvent("generated_review_view_failed_not_found", {
      post_slug: slug || null,
      post_id: id || null,
      post_mode: isPreviewMode ? "draft_preview" : "published",
      failure_reason: "post_not_found",
    });
  }, [id, isError, isLoading, isPreviewMode, post, slug]);

  // Fetch related gear based on post tags with a category fallback
  const {
    data: relatedGear,
    isLoading: isLoadingRelatedGear,
  } = useRelatedGear(post?.tags || [], post?.category);

  useEffect(() => {
    if (
      isLoading ||
      isLoadingRelatedGear ||
      !post?.isGeneratedGearReview ||
      !post ||
      (relatedGear && relatedGear.length > 0)
    ) {
      return;
    }

    const trackingKey = `${isPreviewMode ? "draft_preview" : "published"}:${post.databaseId || post.id}`;
    if (relatedGearUnavailableTrackedRef.current === trackingKey) {
      return;
    }

    relatedGearUnavailableTrackedRef.current = trackingKey;
    trackEvent("generated_review_related_gear_unavailable", {
      post_id: post.databaseId || post.id,
      post_slug: post.id,
      post_mode: isPreviewMode ? "draft_preview" : "published",
      failure_reason: "no_related_gear_candidates",
    });
  }, [isLoading, isLoadingRelatedGear, isPreviewMode, post, relatedGear]);

  usePageMetadata({
    title: post
      ? buildBlogPostTitle(post.title)
      : isPreviewMode
        ? 'Blog Preview | DemoStoke'
        : slug
          ? buildBlogPostTitle(humanizeSlug(slug))
          : currentDocumentTitle,
    description: post?.excerpt,
    image: post?.thumbnail,
    type: 'article',
    canonicalUrl,
    robots,
    trackingReady: isPreviewMode || Boolean(post),
    schema: post
      ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.heroImage,
        datePublished: post.publishedAt,
        author: { '@type': 'Person', name: post.author }
      }
      : undefined
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when the hero section (height 384px = h-96) is scrolled past
      setShowBackToTop(window.scrollY > 384);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!post && isError) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Article temporarily unavailable</h1>
        <Button onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">The blog post you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "gear reviews": "bg-rose-500 text-white hover:bg-rose-600",
      surfboards: "bg-lime-300 text-gray-900 hover:bg-lime-400",
      snowboards: "bg-lime-300 text-gray-900 hover:bg-lime-400",
      skis: "bg-lime-300 text-gray-900 hover:bg-lime-400",
      "mountain bikes": "bg-lime-300 text-gray-900 hover:bg-lime-400",
      "stories that stoke": "bg-fuchsia-500 text-gray-900 hover:bg-fuchsia-600",
      guides: "bg-sky-500 text-white hover:bg-sky-600"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="bg-amber-500 text-white py-3 px-4">
          <div className="container mx-auto flex items-center justify-between max-w-4xl">
            <span className="font-semibold">Preview Mode - Draft Not Published</span>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/blog/drafts">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Drafts
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/blog/edit/${id}`}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Draft
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative h-96">
        {post.heroImage && <img src={post.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article>
            {/* Article Header */}
            <header className="mb-8">
              <div
                className="flex flex-col items-start gap-2 mb-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <Breadcrumbs
                  items={[
                    { label: "Blog", path: "/blog" },
                    { label: capitalizeWords(post.category), path: `/blog?category=${encodeURIComponent(post.category)}` },
                  { label: post.title, path: `/blog/${encodeURIComponent(post.id)}` },
                  ]}
                  lastItemClassName="inline-block lg:max-w-[440px] lg:truncate"
                />
                <div className="flex items-center gap-2">
                  <Link to={`/blog?category=${encodeURIComponent(post.category)}`}>
                    <Badge className={`${getCategoryColor(post.category)} transition-colors cursor-pointer`}>
                      {post.category}
                    </Badge>
                  </Link>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.publishedAt)}
                  </div>
                </div>
              </div>

              {/* Admin Action Row */}
              {isAdmin && !isPreviewMode && post.databaseId && (
                <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg border border-border">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Admin:</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/blog/edit/${post.databaseId}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Post
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/blog/drafts">
                      <FileText className="h-4 w-4 mr-1" />
                      View Drafts
                    </Link>
                  </Button>
                </div>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>

              <div className="text-xl mb-6 leading-relaxed">
                <ContentRenderer content={post.excerpt} textColor="text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <Link
                      to={post.authorId === 'chad-g' ? '/user-profile/chad-g' : `/user-profile/${slugify(post.author)}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.author}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    {/* <Clock className="h-4 w-4 mr-1" /> */}
                    {/* {post.readTime} min read */}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </header>

            {post.videoEmbed && (() => {
              const extractSrc = (html: string) => {
                const m = html.match(/src="([^"]+)"/i);
                return m ? m[1] : null;
              };
              const src = extractSrc(post.videoEmbed);
              let safeSrc: string | null = null;
              try {
                if (src) {
                  const u = new URL(src);
                  const host = u.hostname.replace(/^www\./, '');
                  if (u.protocol === 'https:' || u.protocol === 'http:') {
                    if (host === 'youtu.be') {
                      safeSrc = `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`;
                    } else if (host === 'youtube.com' && u.pathname.startsWith('/embed')) {
                      safeSrc = u.toString();
                    } else if (host === 'player.vimeo.com' && u.pathname.startsWith('/video/')) {
                      safeSrc = u.toString();
                    }
                  }
                }
              } catch { }
              return safeSrc ? (
                <div className="mb-8">
                  <iframe
                    className="aspect-video w-full"
                    src={safeSrc}
                    title="Embedded video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : null;
            })()}


            {/* Article Body */}
            <ContentRenderer
              content={post.content}
              className="mb-8"
            />

            {/* Tags */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(post.tags)).map((tag) => (
                  <Link key={tag} to={`/blog?search=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="hover:text-primary hover:border-primary hover:bg-transparent transition-colors cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="border-t pt-8">
                <h4 className="text-lg font-semibold mb-4">More from this category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${encodeURIComponent(relatedPost.id)}`}
                      className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <img
                          src={relatedPost.thumbnail}
                          alt={relatedPost.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h5 className="font-medium line-clamp-2 mb-1">
                            {relatedPost.title}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {relatedPost.readTime} min read
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Gear Section */}
            {!isLoadingRelatedGear && relatedGear && relatedGear.length > 0 && (
              <RelatedGear
                relatedGear={relatedGear}
                onViewClick={
                  post.isGeneratedGearReview
                    ? (gear) =>
                        trackGeneratedGearReviewRelatedGearClick(
                          post,
                          isPreviewMode ? "draft_preview" : "published",
                          gear,
                        )
                    : undefined
                }
              />
            )}
          </article>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <Button
        onClick={scrollToTop}
        className={`fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300 ${showBackToTop
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        size="icon"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default BlogPostPage;
