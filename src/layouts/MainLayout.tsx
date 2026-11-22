'use client';

import type { ReactNode } from 'react';

import { useLocation } from "@/lib/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const showMainFooter = location.pathname !== '/blog' && location.pathname !== '/blog/create';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      {showMainFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
