
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Snowflake, Waves, Shield, Clock, Users } from "lucide-react";
import usePageMetadata from "@/hooks/usePageMetadata";

const HowItWorksPage = () => {
  usePageMetadata({
    title: "How It Works | DemoStoke - Try Before You Buy",
    description: "Learn how DemoStoke connects you with local gear for snowboards, skis, surfboards, and mountain bikes. Find, demo, and buy the perfect equipment for your adventures.",
    type: "website"
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-ocean-light/20 to-ocean/20">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Browse gear based on where you ride, how you ride, and what makes you feel alive.
              Demo snowboards, skis, bikes, or surfboards from local shops, indie shapers, or other riders
              — all matched to your conditions, skill level, and vibe.
            </p>
            <p className="text-lg text-muted-foreground">
              If it clicks, keep riding it. If not, try again — until you find <em>the one.</em>
            </p>
          </div>
        </div>
      </section>

      {/* Main Steps */}
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-ocean-light p-6 rounded-full mb-6 w-24 h-24 mx-auto flex items-center justify-center">
                <MapPin className="h-12 w-12 text-ocean" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Find Local Gear</h3>
              <p className="text-muted-foreground mb-4">
                Browse through available equipment in your area using our interactive map. 
                Filter by category, skill level, and distance to find exactly what you need.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Snowboards & Skis</li>
                <li>• Surfboards</li>
                <li>• Mountain Bikes</li>
                <li>• Equipment from local shops and shapers</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-ocean-light p-6 rounded-full mb-6 w-24 h-24 mx-auto flex items-center justify-center">
                <Snowflake className="h-12 w-12 text-ocean" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Request a Demo</h3>
              <p className="text-muted-foreground mb-4">
                Connect with the gear owner and arrange a time to try out the equipment. 
                All demos are coordinated through our secure platform.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Direct messaging with owners</li>
                <li>• Flexible scheduling</li>
                <li>• Safety guidelines provided</li>
                <li>• Demo calendar integration</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="bg-ocean-light p-6 rounded-full mb-6 w-24 h-24 mx-auto flex items-center justify-center">
                <Waves className="h-12 w-12 text-ocean" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Buy What You Ride</h3>
              <p className="text-muted-foreground mb-4">
                If you love the gear, purchase it directly from the owner or shop. 
                If not, try something else! No pressure, just pure stoke.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Try before you buy</li>
                <li>• Direct owner transactions</li>
                <li>• No commitment required</li>
                <li>• Find your perfect match</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-zinc-900/10 dark:bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why DemoStoke?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing how outdoor enthusiasts find and try gear
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-ocean mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-muted-foreground">
                All transactions and communications happen through our secure platform
              </p>
            </div>

            <div className="text-center p-6">
              <Clock className="h-12 w-12 text-ocean mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Flexible Scheduling</h3>
              <p className="text-muted-foreground">
                Demo gear on your schedule with our integrated calendar system
              </p>
            </div>

            <div className="text-center p-6">
              <Users className="h-12 w-12 text-ocean mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Connect with local shops, shapers, and fellow riders in your area
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Gear?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start exploring available equipment in your area and connect with the local outdoor community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/explore">Start Exploring</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/demo-calendar">View Demo Calendar</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
