
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MainLayout = () => {
  const location = useLocation();
  const showMainFooter = location.pathname !== '/blog' && location.pathname !== '/blog/create';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {showMainFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
