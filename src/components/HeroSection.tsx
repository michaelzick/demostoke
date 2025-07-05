import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Snowflake, Mountains, Waves, Fish, Bicycle } from "@phosphor-icons/react";
import { useAuth } from "@/helpers";
import { getVideoUrl } from "@/utils/videoUpload";

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // const backgrounds = [
  //   { type: 'video', url: getVideoUrl('surfers_compressed.mp4') },
  //   { type: 'video', url: getVideoUrl('snowboarder_compressed.mp4') },
  //   { type: 'video', url: getVideoUrl('skier_compressed.mp4') },
  //   { type: 'video', url: getVideoUrl('skater_compressed.mp4') },
  //   { type: 'video', url: getVideoUrl('sup_compressed.mp4') },
  // ];

  const backgrounds = [
    { type: '', url: 'https://images.unsplash.com/photo-1617939533073-6c94c709370c?q=80&w=3544&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { type: '', url: 'https://images.unsplash.com/photo-1509791413599-93ba127a66b7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3' },
    { type: '', url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { type: '', url: 'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?q=80&w=3512&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const search = new URLSearchParams({ q: searchQuery.trim() }).toString();
      navigate(`/search?${search}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {bg.type === 'video' ? (
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              poster="https://images.unsplash.com/photo-1617939533073-6c94c709370c?q=80&w=3544&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={bg.url} type="video/mp4" />
            </video>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${bg.url}')` }}
            />
          )}
        </div>
      ))}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-white">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 text-primary" style={{ fontFamily: 'Tahoma, sans-serif' }}>
            DemoStoke
          </h1>
          <h2 className="text-xl sm:text-3xl mb-8 max-w-2xl mx-auto text-shop">
            Ride what makes you feel alive.
          </h2>
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What are you looking for?"
                  className="pl-10 h-12 text-base bg-white/90 dark:bg-zinc-900/90 border-white/20 dark:border-zinc-700/50 text-foreground"
                />
              </div>
              <Button 
                size="lg" 
                onClick={() => handleSearch()}
                disabled={!searchQuery.trim()}
                className="bg-primary hover:bg-primary/90 h-12 px-6"
              >
                Search
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            <Link
              to="/explore?category=snowboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Snowflake className="h-6 w-6" weight="fill" />
              <span className="text-sm font-medium">Snowboards</span>
            </Link>
            <Link
              to="/explore?category=skis"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Mountains className="h-6 w-6" weight="fill" />
              <span className="text-sm font-medium">Skis</span>
            </Link>
            <Link
              to="/explore?category=surfboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Waves className="h-6 w-6" weight="fill" />
              <span className="text-sm font-medium">Surfboards</span>
            </Link>
            <Link
              to="/explore?category=mountain-bikes"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Bicycle className="h-6 w-6" />
              <span className="text-sm font-medium">Mountain Bikes</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {backgrounds.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${index === activeIndex ? 'bg-white dark:bg-zinc-100 w-6' : 'bg-white/50 dark:bg-zinc-400/50'
              }`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
