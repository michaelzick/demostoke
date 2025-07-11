import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './contexts/auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import AddGearForm from './pages/AddGearForm';
import LightspeedPOSPage from './pages/LightspeedPOSPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactUsPage';
import NotFoundPage from './pages/NotFound';
import ExplorePage from './pages/ExplorePage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import ListGearPage from './pages/ListYourGearPage';
import EditGearPage from './pages/EditGearForm';
import UserProfilePage from './pages/UserProfilePage';
import MyEquipmentPage from './pages/MyEquipmentPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BookingsPage from './pages/BookingsPage';
import AdminPage from './pages/AdminPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import RealUserProfilePage from './pages/RealUserProfilePage';
import GearOwnerProfilePage from './pages/GearOwnerProfilePage';
import ShopPage from './pages/ShopPage';
import PrivatePartyPage from './pages/PrivatePartyPage';
import SearchResultsPage from './pages/SearchResultsPage';
import DemoCalendarPage from './pages/DemoCalendarPage';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const AppServer = ({ url }: { url: string }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <StaticRouter location={url}>
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
          </StaticRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default AppServer;
