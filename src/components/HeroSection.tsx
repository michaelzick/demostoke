
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from "lucide-react";

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const backgrounds = [
    "bg-[url('https://images.unsplash.com/photo-1617939533073-6c94c709370c?q=80&w=3544&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
    "bg-[url('https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
    "bg-[url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
    "bg-[url('https://images.unsplash.com/photo-1646082270297-ba5024c19ffb?q=80&w=3538&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
    "bg-[url('https://images.unsplash.com/photo-1534531304203-b830551771b9?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')]",
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
          className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${bg} ${index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
        />
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-white">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4">
            DemoStoke
          </h1>
          <h2 className="text-xl sm:text-3xl mb-8 max-w-2xl mx-auto">
            Don’t just get stoked. Demo it.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button size="lg" asChild className='bg-primary'>
              <Link to="/explore">Find Gear Near Me</Link>
            </Button>
            <Link to="/add-gear">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/20 border-white"
              >
                List Your Gear
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <Link
              to="/explore?category=snowboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">Snowboards</span>
            </Link>
            <Link
              to="/explore?category=skis"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">Skis</span>
            </Link>
            <Link
              to="/explore?category=surfboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">Surfboards</span>
            </Link>
            <Link
              to="/explore?category=sups"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">SUPs</span>
            </Link>
            <Link
              to="/explore?category=skateboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <ArrowRight className="h-6 w-6" />
              <span className="text-sm font-medium">Skateboards</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {backgrounds.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${index === activeIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
