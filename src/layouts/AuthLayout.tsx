
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-ocean-light dark:bg-mountain-dark">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="DemoStoke Logo"
            className="h-8 w-auto"
          />
          <span className="ml-2 text-xl font-bold dark:text-white">DemoStoke</span>
        </Link>
        <div className="ml-auto">
          <Button variant="ghost" asChild className="dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
