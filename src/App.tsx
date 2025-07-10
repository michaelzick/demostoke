
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AddGearForm from './pages/AddGearForm';
import LightspeedPOSPage from './pages/LightspeedPOSPage';
import LoadingSpinner from './components/LoadingSpinner';
import { initializeAmplitudeClickTracking } from "./utils/amplitudeClickTracking";

const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const ContactPage = lazy(() => import("./pages/ContactUsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const EquipmentDetailPage = lazy(() => import("./pages/EquipmentDetailPage"));
const ListGearPage = lazy(() => import("./pages/ListYourGearPage"));
const EditGearPage = lazy(() => import("./pages/EditGearForm"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const MyEquipmentPage = lazy(() => import("./pages/MyEquipmentPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const RealUserProfilePage = lazy(() => import("./pages/RealUserProfilePage"));
const GearOwnerProfilePage = lazy(() => import("./pages/GearOwnerProfilePage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const PrivatePartyPage = lazy(() => import("./pages/PrivatePartyPage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const DemoCalendarPage = lazy(() => import("./pages/DemoCalendarPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    initializeAmplitudeClickTracking();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="signin" element={<SignInPage />} />
                    <Route path="signup" element={<SignUpPage />} />
                  </Route>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:slug" element={<BlogPostPage />} />
                    <Route path="contact-us" element={<ContactPage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path=":category/:slug" element={<EquipmentDetailPage />} />
                    <Route path="list-your-gear" element={<ListGearPage />} />
                    <Route path="list-your-gear/add-gear-form" element={<AddGearForm />} />
                    <Route path="list-your-gear/lightspeed-pos" element={<LightspeedPOSPage />} />
                    <Route path="edit-gear/:id" element={<EditGearPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="my-gear" element={<MyEquipmentPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="user-profile/:slug" element={<RealUserProfilePage />} />
                    <Route path="owner/:id" element={<GearOwnerProfilePage />} />
                    <Route path="shop/:shopId" element={<ShopPage />} />
                    <Route path="private-party/:partyId" element={<PrivatePartyPage />} />
                    <Route path="search" element={<SearchResultsPage />} />
                    <Route path="demo-calendar" element={<DemoCalendarPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
