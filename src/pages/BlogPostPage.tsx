import { useParams, Link } from "react-router-dom";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Clock, User, Calendar, Share2, ArrowUp } from "lucide-react";
import { blogPosts } from "@/lib/blog";
import { useEffect, useState } from "react";
import { useRelatedGear } from "@/hooks/useRelatedGear";
import RelatedGear from "@/components/equipment-detail/RelatedGear";
import MarkdownTextRenderer from "@/components/blog/MarkdownTextRenderer";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string; }>();
  const post = blogPosts.find(p => p.id === slug);
  const [showBackToTop, setShowBackToTop] = useState(false);

  usePageMetadata({
    title: post ? `${post.title} | DemoStoke` : 'Blog Post | DemoStoke',
    description: post?.excerpt,
    image: post?.heroImage,
    type: 'article',
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

  // Fetch related gear based on the blog post tags
  const {
    data: relatedGear,
    isLoading: isLoadingRelatedGear,
  } = useRelatedGear(post?.tags || []);

  console.log("Post ID:", slug);

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
      day: "numeric"
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "gear reviews": "bg-rose-500 text-white hover:bg-rose-600",
      snowboards: "bg-lime-300 text-gray-900 hover:bg-lime-400",
      skis: "bg-lime-300 text-gray-900 hover:bg-lime-400",
      surfboards: "bg-lime-300 text-gray-900 hover:bg-lime-400",
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
      {/* Hero Image */}
      <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: `url(${post.heroImage})` }}>
        <div className="absolute inset-0 bg-black/40" />
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
                    { label: post.title, path: `/blog/${post.id}` },
                  ]}
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

              <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                <MarkdownTextRenderer text={post.excerpt} />
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <Link
                      to={post.authorId !== 'generative-ai' ? `/user-profile/${post.authorId}` : '#'}
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

            {post.videoEmbed && (
              <div className="mb-8">
                <div
                  className="aspect-video w-full"
                  dangerouslySetInnerHTML={{ __html: post.videoEmbed }}
                />
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none mb-8">
              {post.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold mt-8 mb-4">
                      {paragraph.replace(/\*\*/g, '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  const listItems = paragraph.split('\n- ').map(item => item.replace(/^- /, ''));
                  return (
                    <ul key={index} className="list-disc list-inside space-y-2 mb-6">
                      {listItems.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <MarkdownTextRenderer text={item} />
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="mb-6 leading-relaxed">
                    <MarkdownTextRenderer text={paragraph} />
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/blog?search=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="hover:text-primary hover:border-primary hover:bg-transparent transition-colors cursor-pointer">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Posts */}
            {blogPosts.filter(p => p.category === post.category && p.id !== post.id).length > 0 && (
              <div className="border-t pt-8">
                <h4 className="text-lg font-semibold mb-4">More from this category</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogPosts
                    .filter(p => p.category === post.category && p.id !== post.id)
                    .slice(0, 2)
                    .map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        to={`/blog/${relatedPost.id}`}
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
              <RelatedGear relatedGear={relatedGear} />
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
