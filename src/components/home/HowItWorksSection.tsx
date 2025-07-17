
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Snowflake, Waves } from "@phosphor-icons/react";

const HowItWorksSection = () => {
  return (
    <section className="py-8 bg-white dark:bg-black">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Browse gear based on where you ride, how you ride, and what makes you feel alive.
            Demo snowboards, skis, bikes, or surfboards from local shops, indie shapers, or other riders (coming soon)
            — all matched to your conditions, skill level, and vibe.
            If it clicks, keep riding it. If not, try again — until you find <em>the one.</em>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-ocean-light p-4 rounded-full mb-4">
              <MapPin className="h-8 w-8 how-it-works-icon" />
            </div>
            <h3 className="text-xl font-medium mb-2">Find Local Gear</h3>
            <p className="text-muted-foreground">
              Browse through available equipment in your area using our interactive map.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-ocean-light p-4 rounded-full mb-4">
              <Snowflake className="h-8 w-8 how-it-works-icon" weight="fill" />
            </div>
            <h3 className="text-xl font-medium mb-2">Request a Demo</h3>
            <p className="text-muted-foreground">
              Connect with the owner and arrange a time to try out the equipment.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-ocean-light p-4 rounded-full mb-4">
              <Waves className="h-8 w-8 how-it-works-icon" weight="fill" />
            </div>
            <h3 className="text-xl font-medium mb-2">Buy What You Ride</h3>
            <p className="text-muted-foreground">
              If you love the gear, purchase it directly from the owner or shop. If not, try something else!
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/explore">Get Started</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
