
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import AddGearForm from '../pages/AddGearForm';
import LightspeedPOSPage from '../pages/LightspeedPOSPage';
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import BlogPage from "../pages/BlogPage";
import BlogPostPage from "../pages/BlogPostPage";
import ContactPage from "../pages/ContactUsPage";
import HowItWorksPage from "../pages/HowItWorksPage";
import PrivacyPolicyPage from "../pages/PrivacyPolicyPage";
import TermsOfServicePage from "../pages/TermsOfServicePage";
import NotFoundPage from "../pages/NotFound";
import ExplorePage from "../pages/ExplorePage";
import EquipmentDetailPage from "../pages/EquipmentDetailPage";
import ListGearPage from "../pages/ListYourGearPage";
import EditGearPage from "../pages/EditGearForm";

import MyEquipmentPage from "../pages/MyEquipmentPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import BookingsPage from "../pages/BookingsPage";
import AdminPage from "../pages/AdminPage";
import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import RealUserProfilePage from "../pages/RealUserProfilePage";
import GearOwnerProfilePage from "../pages/GearOwnerProfilePage";
import ChadGProfilePage from "../pages/ChadGProfilePage";
import ShopPage from "../pages/ShopPage";
import PrivatePartyPage from "../pages/PrivatePartyPage";
import SearchResultsPage from "../pages/SearchResultsPage";
import DemoCalendarPage from "../pages/DemoCalendarPage";

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="signin" element={<SignInPage />} />
          {/* <Route path="signup" element={<SignUpPage />} /> */}
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="terms-of-service" element={<TermsOfServicePage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPostPage />} />
          <Route path="contact-us" element={<ContactPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path=":category/:ownerSlug/:slug" element={<EquipmentDetailPage />} />
          <Route path="list-your-gear" element={<ListGearPage />} />
          <Route path="list-your-gear/add-gear-form" element={<AddGearForm />} />
          <Route path="list-your-gear/lightspeed-pos" element={<LightspeedPOSPage />} />
          <Route path="edit-gear/:id" element={<EditGearPage />} />
          
          <Route path="my-gear" element={<MyEquipmentPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="user-profile/:slug" element={<RealUserProfilePage />} />
          <Route path="profile/chad-g" element={<ChadGProfilePage />} />
          <Route path="owner/:id" element={<GearOwnerProfilePage />} />
          <Route path="shop/:shopId" element={<ShopPage />} />
          <Route path="private-party/:partyId" element={<PrivatePartyPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="demo-calendar" element={<DemoCalendarPage />} />
          <Route path="demo-calendar/event/:eventSlug" element={<DemoCalendarPage />} />
          <Route path="event/:eventSlug" element={<DemoCalendarPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
    </Routes>
  );
};

export default AppRoutes;
