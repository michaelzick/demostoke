import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, User, Calendar } from "lucide-react";
import { blogPosts, BlogPost } from "@/lib/blog";
import { searchBlogPostsWithNLP } from "@/services/blogSearchService";

const BlogPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [searchResults, setSearchResults] = useState<BlogPost[]>(blogPosts);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>(searchParams.get('category') || "");

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle URL params on page load
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');

    if (urlSearch) {
      setSearchQuery(urlSearch);
      handleSearch(urlSearch, urlCategory || "");
    } else if (urlCategory) {
      setSelectedFilter(urlCategory);
      applyFilter(urlCategory);
    }
  }, [searchParams]);

  const filters = [
    { label: "Gear Reviews", value: "gear reviews" },
    { label: "Snowboards", value: "snowboards" },
    { label: "Skis", value: "skis" },
    { label: "Surfboards", value: "surfboards" },
    { label: "Mountain Bikes", value: "mountain bikes" },
    { label: "Stories That Stoke", value: "stories that stoke" }
  ];

  const handleSearch = async (query?: string, filter?: string) => {
    const searchTerm = query !== undefined ? query : searchQuery;
    const filterTerm = filter !== undefined ? filter : selectedFilter;

    if (!searchTerm.trim()) {
      applyFilter(filterTerm);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchBlogPostsWithNLP(searchTerm, blogPosts);
      const filteredResults = filterTerm
        ? results.filter(post => post.category === filterTerm || post.tags.includes(filterTerm))
        : results;
      setSearchResults(filteredResults);

      // Update URL
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (filterTerm) params.set('category', filterTerm);
      navigate(`/blog?${params.toString()}`, { replace: true });
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);

    if (!filter) {
      setSearchResults(blogPosts);
      // Update URL - remove category param
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      navigate(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
      return;
    }

    const filtered = blogPosts.filter(post =>
      post.category === filter || post.tags.includes(filter)
    );
    setSearchResults(filtered);

    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filter) params.set('category', filter);
    navigate(`/blog?${params.toString()}`, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("");
    setSearchResults(blogPosts);
    navigate('/blog', { replace: true });
  };

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
      "stories that stoke": "bg-fuchsia-500 text-gray-900 hover:bg-fuchsia-600"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              DemoStoke Blog
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover tips, techniques, and stories from the world of outdoor gear
            </p>

            {/* Search Bar */}
            <div className="flex max-w-md mx-auto gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-white text-gray-900"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Filter Pills */}
            <div className="mt-6">
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyFilter("")}
                  className={`px-4 py-2 text-sm ${
                    selectedFilter === ""
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                  }`}
                >
                  All Posts
                </Button>
                {filters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedFilter === filter.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFilter(filter.value)}
                    className={`px-4 py-2 text-sm ${
                      selectedFilter === filter.value
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                    }`}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {(searchQuery || selectedFilter) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 py-12">
        {(searchQuery || selectedFilter) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Filtered by: ${filters.find(f => f.value === selectedFilter)?.label || selectedFilter}`}
            </h2>
            <p className="text-muted-foreground">
              {searchResults.length} {searchResults.length === 1 ? "post" : "posts"} found
            </p>
          </div>
        )}

        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or browse all posts below.
            </p>
            <Button onClick={clearSearch}>
              View All Posts
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link to={`/blog/${post.id}`} className="block">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
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
                  <CardTitle className="line-clamp-2">
                    <Link
                      to={`/blog/${post.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <Link
                        to={post.authorId !== 'generative-ai' ? `/user-profile/${post.authorId}` : '#'}
                        className="hover:text-primary transition-colors"
                      >
                        {post.author}
                      </Link>
                    </div>
                    <div className="flex items-center">
                      {/* <Clock className="h-3 w-3 mr-1" /> */}
                      {/* {post.readTime} min read */}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Link key={tag} to={`/blog?search=${encodeURIComponent(tag)}`}>
                        <Badge variant="outline" className="text-xs hover:text-primary hover:border-primary hover:bg-transparent transition-colors cursor-pointer">
                          {tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
