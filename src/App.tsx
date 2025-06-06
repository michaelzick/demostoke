
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import GoogleTagManager from "@/components/GoogleTagManager";

// Lazy load components for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
const EquipmentDetailPage = lazy(() => import("./pages/EquipmentDetailPage"));
const ListYourGearPage = lazy(() => import("./pages/ListYourGearPage"));
const AddGearForm = lazy(() => import("./pages/AddGearForm"));
const EditGearForm = lazy(() => import("./pages/EditGearForm"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const GearOwnerProfilePage = lazy(() => import("./pages/GearOwnerProfilePage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const MyEquipmentPage = lazy(() => import("./pages/MyEquipmentPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const LightspeedPOSPage = lazy(() => import("./pages/LightspeedPOSPage"));
const PrivatePartyPage = lazy(() => import("./pages/PrivatePartyPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Layouts
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <GoogleTagManager />
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
                  </div>
                }>
                  <Routes>
                    {/* Main layout routes */}
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="contact" element={<ContactUsPage />} />
                      <Route path="explore" element={<ExplorePage />} />
                      <Route path="search" element={<SearchResultsPage />} />
                      <Route path="equipment/:id" element={<EquipmentDetailPage />} />
                      <Route path="list-your-gear" element={<ListYourGearPage />} />
                      <Route path="add-gear" element={<AddGearForm />} />
                      <Route path="edit-gear/:id" element={<EditGearForm />} />
                      <Route path="profile" element={<UserProfilePage />} />
                      <Route path="gear-owner/:id" element={<GearOwnerProfilePage />} />
                      <Route path="bookings" element={<BookingsPage />} />
                      <Route path="my-equipment" element={<MyEquipmentPage />} />
                      <Route path="my-gear" element={<MyEquipmentPage />} />
                      <Route path="blog" element={<BlogPage />} />
                      <Route path="blog/:slug" element={<BlogPostPage />} />
                      <Route path="admin" element={<AdminPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="lightspeed-pos" element={<LightspeedPOSPage />} />
                      <Route path="private-party/:partyId" element={<PrivatePartyPage />} />
                      <Route path="shop/:shopId" element={<ShopPage />} />
                    </Route>

                    {/* Auth layout routes */}
                    <Route path="/auth" element={<AuthLayout />}>
                      <Route path="signin" element={<SignInPage />} />
                      <Route path="signup" element={<SignUpPage />} />
                    </Route>

                    {/* Redirects for old auth routes */}
                    <Route path="/signin" element={<Navigate to="/auth/signin" replace />} />
                    <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />

                    {/* 404 catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </div>
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
