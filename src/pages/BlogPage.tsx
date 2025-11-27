import { useState, useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import BlogFilterSidebar from "@/components/blog/BlogFilterSidebar";
import { BlogPost } from "@/lib/blog";
import { blogService } from "@/services/blogService";
import { slugify } from "@/utils/slugify";
import { searchBlogPostsWithNLP } from "@/services/blogSearchService";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { featuredPostsService, MAX_FEATURED_POSTS } from "@/services/featuredPostsService";
import BlogFooter from "@/components/BlogFooter";
import { useAuth } from "@/contexts/auth";

const POSTS_PER_PAGE = 12;

const BlogPageInner = () => {
  usePageMetadata({
    title: 'DemoStoke Blog',
    description: 'Tips, gear reviews and stories from the DemoStoke community.'
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [searchResults, setSearchResults] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>(searchParams.get('category') || "");
  const [featuredPosts, setFeaturedPosts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const { data: userRole } = useUserRole();
  const isAdmin = userRole === 'admin';
  const { toggleSidebar } = useSidebar();

  // Pagination calculations
  const totalPages = Math.ceil(searchResults.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedResults = searchResults.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Load all posts and featured posts on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [posts, featuredIds] = await Promise.all([
          blogService.getAllPosts(),
          featuredPostsService.getFeaturedPosts()
        ]);
        setAllPosts(posts);
        setSearchResults(posts);
        setFeaturedPosts(featuredIds);
      } catch (error) {
        console.error('Error loading blog data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    window.scrollTo(0, 0);
    loadData();
  }, []);

  // Perform search whenever query, filter, or sort changes
  useEffect(() => {
    if (allPosts.length > 0) {
      handleSearch();
    }
  }, [searchQuery, selectedFilter, sortBy, selectedDateFilter, showFeaturedOnly, allPosts]);

  // Sync state with URL params (e.g. when navigating with browser controls)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || "";
    const urlCategory = searchParams.get('category') || "";
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    setSearchQuery(urlSearch);
    setSelectedFilter(urlCategory);
    setCurrentPage(urlPage);
  }, [searchParams]);

  // Reset to page 1 when search results change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [searchResults.length, totalPages, currentPage]);

  const filters = [
    { label: "Gear Reviews", value: "gear reviews" },
    { label: "Snowboards", value: "snowboards" },
    { label: "Skis", value: "skis" },
    { label: "Surfboards", value: "surfboards" },
    { label: "Mountain Bikes", value: "mountain bikes" },
    { label: "Stories That Stoke", value: "stories that stoke" },
    { label: "Stories That Suck", value: "stories that suck" },
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
      // Check if the search term is an exact tag match first
      const exactTagMatches = allPosts.filter(post =>
        post.tags.some(tag => tag.toLowerCase() === searchTerm.toLowerCase())
      );

      let results;
      if (exactTagMatches.length > 0) {
        // If we found exact tag matches, use those
        results = exactTagMatches;
      } else {
        // Otherwise, fall back to NLP search
        results = await searchBlogPostsWithNLP(searchTerm, allPosts);
      }

      let filteredResults = filterTerm
        ? results.filter(post => post.category === filterTerm || post.tags.includes(filterTerm))
        : results;

      // Apply date filter
      if (selectedDateFilter) {
        filteredResults = filteredResults.filter(post => {
          const postDate = new Date(post.publishedAt);
          return selectedDateFilter === `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
        });
      }

      // Apply featured posts filter
      if (showFeaturedOnly) {
        filteredResults = filteredResults.filter(post => featuredPosts.includes(post.id));
      }

      // Apply sorting
      filteredResults = sortPosts(filteredResults);

      setSearchResults(filteredResults);
      setCurrentPage(1);

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


  const sortPosts = (posts: BlogPost[]) => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
    });
  };

  const applyFilter = (filter: string) => {
    setSelectedFilter(filter);

    let filtered = !filter ? allPosts : allPosts.filter(post =>
      post.category === filter || post.tags.includes(filter)
    );

    // Apply date filter
    if (selectedDateFilter) {
      filtered = filtered.filter(post => {
        const postDate = new Date(post.publishedAt);
        return selectedDateFilter === `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, '0')}`;
      });
    }

    // Apply featured posts filter
    if (showFeaturedOnly) {
      filtered = filtered.filter(post => featuredPosts.includes(post.id));
    }

    // Apply sorting
    filtered = sortPosts(filtered);

    setSearchResults(filtered);
    setCurrentPage(1);

    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filter) params.set('category', filter);
    navigate(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("");
    setSelectedDateFilter("");
    setShowFeaturedOnly(false);
    setSortBy('latest');
    setCurrentPage(1);
    setSearchResults(sortPosts(allPosts));
    navigate('/blog', { replace: true });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    navigate(`/blog?${params.toString()}`, { replace: true });
  };

  const renderPaginationItems = () => {
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis or page 2
    if (showEllipsisStart) {
      items.push(<PaginationEllipsis key="ellipsis-start" />);
    } else if (totalPages > 1) {
      items.push(
        <PaginationItem key={2}>
          <PaginationLink
            onClick={() => handlePageChange(2)}
            isActive={currentPage === 2}
          >
            2
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last as they're always shown
        if (i === 2 && !showEllipsisStart) continue; // Skip if we already showed page 2
        if (i === totalPages - 1 && !showEllipsisEnd) continue; // Skip if we'll show totalPages-1 later

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis or second-to-last page
    if (showEllipsisEnd) {
      items.push(<PaginationEllipsis key="ellipsis-end" />);
    } else if (totalPages > 2 && currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages - 1)}
            isActive={currentPage === totalPages - 1}
          >
            {totalPages - 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Get unique months/years from all posts
  const getDateOptions = () => {
    const dates = allPosts.map(post => {
      const date = new Date(post.publishedAt);
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      };
    });

    const unique = dates.filter((date, index, arr) =>
      arr.findIndex(d => d.value === date.value) === index
    );

    return unique.sort((a, b) => b.year - a.year || b.month - a.month);
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
      "stories that stoke": "bg-fuchsia-500 text-gray-900 hover:bg-fuchsia-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const handleFeatureToggle = async (postId: string, checked: boolean) => {
    if (checked) {
      if (featuredPosts.length >= MAX_FEATURED_POSTS) {
        toast({
          title: "Maximum Featured Posts",
          description: `You can only feature up to ${MAX_FEATURED_POSTS} blog posts on the homepage.`,
          variant: "destructive"
        });
        return;
      }
      const result = await featuredPostsService.addFeaturedPost(postId);
      if (result.success) {
        setFeaturedPosts(result.posts);
      } else {
        toast({
          title: "Error",
          description: "Failed to feature the blog post. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      const result = await featuredPostsService.removeFeaturedPost(postId);
      if (result.success) {
        setFeaturedPosts(result.posts);

        // If showing featured only and this post was unfeatured, refresh the filtered results
        if (showFeaturedOnly) {
          handleSearch();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to remove the featured blog post. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <>
      <Sidebar className="top-20 h-[calc(100vh-5rem)]">
        <BlogFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedFilter={selectedFilter}
          applyFilter={applyFilter}
          selectedDateFilter={selectedDateFilter}
          setSelectedDateFilter={setSelectedDateFilter}
          getDateOptions={getDateOptions}
          clearSearch={clearSearch}
          filters={filters}
          showFeaturedOnly={showFeaturedOnly}
          setShowFeaturedOnly={setShowFeaturedOnly}
          featuredPostIds={featuredPosts}
        />
      </Sidebar>
      <SidebarInset>
        <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-16 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              DemoStoke Blog
            </h1>
            <p className="text-xl mb-4 text-gray-600 dark:text-blue-100">
              Discover tips, techniques, and stories from the world of outdoor gear
            </p>

            {/* Admin Buttons */}
            {user && isAdmin && (
              <div className="mb-8 flex justify-center gap-2">
                <Button asChild className="w-auto gap-1">
                  <Link to="/blog/create">
                    <Plus className="h-4 w-4" />
                    New Post
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-auto gap-1">
                  <Link to="/blog/drafts">
                    <FileText className="h-4 w-4" />
                    View Drafts
                  </Link>
                </Button>
              </div>
            )}

            <div className="flex justify-center md:hidden">
              <Button size="lg" variant="outline" className="gap-2" onClick={toggleSidebar}>
                <Filter className="h-4 w-4" />
                Search & Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 pb-12">
        {(searchQuery || selectedFilter) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Filtered by: ${filters.find(f => f.value === selectedFilter)?.label || selectedFilter}`}
            </h2>
            <p className="text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + POSTS_PER_PAGE, searchResults.length)} of {searchResults.length} {searchResults.length === 1 ? "post" : "posts"}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        ) : searchResults.length === 0 ? (
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedResults.map((post) => (
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
                    {isAdmin && (
                      <div className="flex items-center gap-2 mb-3">
                        <Checkbox
                          id={`featured-${post.id}`}
                          checked={featuredPosts.includes(post.id)}
                          onCheckedChange={(checked) => handleFeatureToggle(post.id, checked as boolean)}
                          disabled={!featuredPosts.includes(post.id) && featuredPosts.length >= MAX_FEATURED_POSTS}
                        />
                        <label
                          htmlFor={`featured-${post.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Feature on homepage
                        </label>
                      </div>
                    )}
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
                          to={post.authorId === 'chad-g' ? '/profile/chad-g' : `/user-profile/${slugify(post.author)}`}
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
                      {Array.from(new Set(post.tags)).map((tag) => (
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

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    {currentPage > 1 && (
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    )}
                    {renderPaginationItems()}
                    {currentPage < totalPages && (
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <BlogFooter />
  </SidebarInset>
  </>
  );
};

const BlogPage = () => (
  <SidebarProvider>
    <BlogPageInner />
  </SidebarProvider>
);

export default BlogPage;
