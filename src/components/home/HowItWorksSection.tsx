
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Snowflake, Waves } from "@phosphor-icons/react";

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-zinc-900">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Connecting outdoor enthusiasts with local gear for demos is easy.
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
            <h3 className="text-xl font-medium mb-2">Enjoy & Review</h3>
            <p className="text-muted-foreground">
              Have a great experience and leave feedback for the next rider.
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
