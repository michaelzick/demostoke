
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  return (
    <section className="py-16 bg-ocean-deep text-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Have Gear to Share?</h2>
            <p className="text-lg mb-6">
              Earn money by letting others demo your equipment.
            </p>
            <Link to="/list-gear">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 dark:bg-zinc-800/40 border-white dark:border-zinc-700"
              >
                List Your Gear
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 bg-white/10 dark:bg-zinc-700/30 rounded-full w-40 h-40 animate-float homepage-float-1"></div>
              <div className="absolute -bottom-4 -right-4 bg-white/10 dark:bg-zinc-700/30 rounded-full w-24 h-24 animate-float"></div>
              <img
                src="https://images.unsplash.com/photo-1616449973117-0e1d99c56ed3?auto=format&fit=crop&w=600&q=80"
                alt="Person on surfboard"
                className="rounded-lg relative z-10 max-h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
