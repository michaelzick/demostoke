import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { BlogPost } from "@/lib/blog/types";
import { featuredPostsService } from "@/services/featuredPostsService";
import { HorizontalScrollSection } from "./HorizontalScrollSection";

const FeaturedPostsSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Get featured posts from Supabase
    const loadFeaturedPosts = async () => {
      const featuredIds = await featuredPostsService.getFeaturedPosts();
      if (featuredIds.length > 0) {
        // Get all posts (database + static) to find featured ones
        const { blogService } = await import("@/services/blogService");
        const allPosts = await blogService.getAllPosts();
        const posts = allPosts.filter(post => featuredIds.includes(post.id)).slice(0, 5);
        setFeaturedPosts(posts);
      }
    };
    loadFeaturedPosts();
  }, []);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <>
      <HorizontalScrollSection
        title="Featured Blog Posts"
        items={featuredPosts}
        isLoading={false}
        sectionClassName="pt-10 pb-5 bg-ocean-deep text-white"
        desktopCols={{ md: 3, lg: 5 }}
        renderItem={(post) => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="group block snap-start w-[208px] min-w-[208px] shrink-0 md:w-full md:min-w-0"
          >
            <div className="aspect-square overflow-hidden rounded-lg mb-2">
              <img
                src={post.thumbnail}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2 text-left">
              {post.title}
            </h3>
          </Link>
        )}
      />

      {featuredPosts.length > 0 && (
        <div className="bg-ocean-deep text-white pb-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/blog">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 dark:bg-zinc-900/50 border-white dark:border-zinc-600 hover:bg-white/30 hover:text-white dark:hover:bg-zinc-500/40 transition-colors"
              >
                View All Posts
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedPostsSection;
