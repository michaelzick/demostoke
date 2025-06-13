
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
const HomePage = lazy(() => import("./pages/HomePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const ContactPage = lazy(() => import("./pages/ContactUsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));
const ExplorePage = lazy(() => import("./pages/ExplorePage"));
const EquipmentDetailPage = lazy(() => import("./pages/EquipmentDetailPage"));
const ListGearPage = lazy(() => import("./pages/ListYourGearPage"));
const EditGearPage = lazy(() => import("./pages/EditGearForm"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const SignInPage = lazy(() => import("./pages/SignInPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const RealUserProfilePage = lazy(() => import("./pages/RealUserProfilePage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="signin" element={<SignInPage />} />
                    <Route path="signup" element={<SignUpPage />} />
                  </Route>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="equipment/:id" element={<EquipmentDetailPage />} />
                    <Route path="list-your-gear" element={<ListGearPage />} />
                    <Route path="edit-gear/:id" element={<EditGearPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                    <Route path="/user-profile/:id" element={<RealUserProfilePage />} />
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
