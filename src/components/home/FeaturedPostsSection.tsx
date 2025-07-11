import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { BlogPost } from "@/lib/blog/types";
import { featuredPostsService } from "@/services/featuredPostsService";

const FeaturedPostsSection = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Get featured posts from Supabase
    const loadFeaturedPosts = async () => {
      const featuredIds = await featuredPostsService.getFeaturedPosts();
      if (featuredIds.length > 0) {
        // Import blog posts dynamically to get the featured ones
        const { blogPosts } = await import("@/lib/blog");
        const posts = blogPosts.filter(post => featuredIds.includes(post.id)).slice(0, 3);
        setFeaturedPosts(posts);
      }
    };
    loadFeaturedPosts();
  }, []);

  if (featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-ocean-deep text-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-8">Featured Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group block"
                >
                  <div className="aspect-square overflow-hidden rounded-lg mb-3">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
              ))}
              <Link to={`/blog`}>
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
          <div className="flex justify-end mt-12 md:mt-0">
            <div className="relative">
              <div className="absolute -top-6 -left-6 bg-white/10 dark:bg-white/20 rounded-full w-40 h-40 animate-float homepage-float-1"></div>
              <div className="absolute -bottom-4 -right-4 bg-white/10 dark:bg-white/20 rounded-full w-24 h-24 animate-float"></div>
              <img
                src="https://images.unsplash.com/photo-1616449973117-0e1d99c56ed3?auto=format&fit=crop&w=600&q=80"
                alt="Person on surfboard"
                loading="lazy"
                className="rounded-lg relative z-10 max-h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPostsSection;
