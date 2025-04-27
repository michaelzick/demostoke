
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Surfboard, Snowboard, Paddle } from "lucide-react";

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const backgrounds = [
    "bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]",
    "bg-[url('https://images.unsplash.com/photo-1600040308499-5c3327083629?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]",
    "bg-[url('https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')]",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${bg} ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-white">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
            Demo Local. Ride Worldwide.
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-xl mx-auto">
            Find surfboards, snowboards, and SUPs to demo in your area from local enthusiasts.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button size="lg" asChild>
              <Link to="/explore">Find Equipment Near Me</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white hover:bg-white/20">
              List Your Gear
            </Button>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="flex items-center gap-2 animate-float">
              <Surfboard className="h-6 w-6" />
              <span className="text-sm font-medium">Surfboards</span>
            </div>
            <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
              <Paddle className="h-6 w-6" />
              <span className="text-sm font-medium">Paddle Boards</span>
            </div>
            <div className="flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
              <Snowboard className="h-6 w-6" />
              <span className="text-sm font-medium">Snowboards</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {backgrounds.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
            }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
