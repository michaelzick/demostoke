
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/auth";
import EquipmentDetailPage from "./pages/EquipmentDetailPage";
import GearOwnerProfilePage from "@/pages/GearOwnerProfilePage";
import GearListing from "@/pages/GearListing";
import AddGearForm from "@/pages/AddGearForm";
import EditGearForm from "@/pages/EditGearForm";
import UserProfilePage from "@/pages/UserProfilePage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import MyEquipmentPage from "@/pages/MyEquipmentPage";
import BookingsPage from "@/pages/BookingsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ShopPage from "@/pages/ShopPage";
import PrivatePartyPage from "@/pages/PrivatePartyPage";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="equipment/:id" element={<EquipmentDetailPage />} />
                <Route path="/owner/:ownerId" element={<GearOwnerProfilePage />} />
                <Route path="/shop/:shopId" element={<ShopPage />} />
                <Route path="/party/:partyId" element={<PrivatePartyPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:postId" element={<BlogPostPage />} />
                <Route path="gear-listing" element={<GearListing />} />
                <Route path="list-gear" element={<AddGearForm />} />
                <Route path="edit-gear/:id" element={<EditGearForm />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="my-gear" element={<MyEquipmentPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="bookings" element={<BookingsPage />} />
              </Route>
              <Route path="/auth" element={<AuthLayout />}>
                <Route path="signin" element={<SignInPage />} />
                <Route path="signup" element={<SignUpPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
