import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Clock, User, Calendar } from "lucide-react";
import { blogPosts, BlogPost } from "@/lib/blog";
import { searchBlogPostsWithNLP } from "@/services/blogSearchService";

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BlogPost[]>(blogPosts);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filters = [
    { label: "Gear Reviews", value: "gear reviews" },
    { label: "Snowboards", value: "snowboards" },
    { label: "Skis", value: "skis" },
    { label: "Surfboards", value: "surfboards" },
    { label: "SUPs", value: "sups" },
    { label: "Mountain Bikes", value: "mountain-bikes" }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      applyFilter(selectedFilter);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchBlogPostsWithNLP(searchQuery, blogPosts);
      const filteredResults = selectedFilter
        ? results.filter(post => post.category === selectedFilter || post.tags.includes(selectedFilter))
        : results;
      setSearchResults(filteredResults);
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
      return;
    }

    const filtered = blogPosts.filter(post =>
      post.category === filter || post.tags.includes(filter)
    );
    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("");
    setSearchResults(blogPosts);
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
      snowboards: "bg-blue-100 text-blue-800",
      skis: "bg-purple-100 text-purple-800",
      surfboards: "bg-cyan-100 text-cyan-800",
      sups: "bg-green-100 text-green-800",
      skateboards: "bg-orange-100 text-orange-800",
      "gear reviews": "bg-yellow-100 text-yellow-800",
      "mountain-bikes": "bg-red-100 text-red-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
                onClick={handleSearch}
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
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
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
                        to={`/user-profile/${post.authorId}`}
                        className="hover:text-primary transition-colors"
                      >
                        {post.author}
                      </Link>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime} min read
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
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
