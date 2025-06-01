import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/helpers";
import {
  Plus,
  RefreshCw,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Lightbulb
} from "lucide-react";

const ListYourGearPage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (path: string) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/auth/signin");
    }
  };

  const handleScrollToGetStarted = () => {
    const el = document.getElementById("get-started");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Extra Income",
      description: "Turn your unused gear into a steady revenue stream"
    },
    {
      icon: Users,
      title: "Help the Community",
      description: "Share your passion and help others enjoy outdoor sports"
    },
    {
      icon: BarChart3,
      title: "Track Performance",
      description: "Monitor your rental performance with detailed analytics"
    },
    {
      icon: Clock,
      title: "Flexible Schedule",
      description: "Rent on your own terms and availability"
    }
  ];

  const features = [
    "Professional gear photography tips",
    "Automated pricing suggestions",
    "Insurance coverage for rentals",
    "24/7 customer support",
    "Secure payment processing",
    "Equipment damage protection"
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          List Your Gear
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Transform your unused outdoor equipment into a profitable rental business.
          Join thousands of gear owners earning extra income while helping fellow outdoor enthusiasts.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {benefits.map((benefit, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <benefit.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Getting Started Options */}
      <div className="mb-12" id="get-started">
        <h2 className="text-3xl font-bold text-center mb-8">Get Started</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual Entry Option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Plus className="h-6 w-6 text-blue-600" />
                Manual Entry
              </CardTitle>
              <CardDescription>
                Perfect for individual gear owners and small collections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Quick Setup</p>
                    <p className="text-sm text-muted-foreground">Add gear details, photos, and pricing in minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Full Control</p>
                    <p className="text-sm text-muted-foreground">Complete control over descriptions and pricing</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No Technical Knowledge</p>
                    <p className="text-sm text-muted-foreground">User-friendly form that anyone can use</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleGetStarted("/list-gear/add-gear-form")}
                className="w-full"
                size="lg"
              >
                Add Gear Manually
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* POS Integration Option */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 text-purple-600" />
                POS Integration
              </CardTitle>
              <CardDescription>
                Ideal for shops and businesses with existing inventory systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Bulk Import</p>
                    <p className="text-sm text-muted-foreground">Sync entire inventory automatically</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-sm text-muted-foreground">Inventory stays synchronized</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Lightspeed POS</p>
                    <p className="text-sm text-muted-foreground">Currently supported platform</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleGetStarted("/list-gear/lightspeed-pos")}
                className="w-full"
                size="lg"
              >
                Setup POS Integration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-yellow-500" />
            What You Get
          </CardTitle>
          <CardDescription>
            Everything you need to successfully rent your gear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our community of gear owners and start generating income from your unused equipment today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleScrollToGetStarted}
                size="lg"
                className="px-8"
              >
                Get Started Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListYourGearPage;
