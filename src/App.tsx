import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from './contexts/auth';
import { ClientOnlyToaster } from './components/ClientOnlyToaster';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ExplorePage from './pages/ExplorePage';
import LazyAnalyticsPage from './pages/LazyAnalyticsPage';
import AboutPage from './pages/AboutPage';
import ContactUsPage from './pages/ContactUsPage';
import NotFound from './pages/NotFound';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import LazyMapComponent from "@/components/LazyMapComponent";
import LazyHybridView from "@/components/LazyHybridView";

const queryClient = new QueryClient();

interface AppProps {
  Router?: React.ComponentType<any>;
  routerProps?: any;
}

function App({ Router = BrowserRouter, routerProps = {} }: AppProps = {}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>
            <ClientOnlyToaster />
            <Router {...routerProps}>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/analytics" element={<LazyAnalyticsPage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:postId" element={<BlogPostPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
