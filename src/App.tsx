import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from './contexts/AuthContext';
import { ClientOnlyToaster } from './components/ClientOnlyToaster';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import ExplorePage from './pages/ExplorePage';
import GearPage from './pages/GearPage';
import ProfilePage from './pages/ProfilePage';
import ManageGearPage from './pages/ManageGearPage';
import EditGearPage from './pages/EditGearPage';
import NewGearPage from './pages/NewGearPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import PasswordResetPage from './pages/PasswordResetPage';
import LazyMapComponent from "@/components/LazyMapComponent";
import LazyHybridView from "@/components/LazyHybridView";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={0}>
            <ClientOnlyToaster />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/gear/:gearId" element={<GearPage />} />
                  <Route path="/profile/:userId" element={<ProfilePage />} />
                  <Route path="/manage-gear" element={<ManageGearPage />} />
                  <Route path="/edit-gear/:gearId" element={<EditGearPage />} />
                  <Route path="/new-gear" element={<NewGearPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:postId" element={<BlogPostPage />} />
                  <Route path="/password-reset" element={<PasswordResetPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
