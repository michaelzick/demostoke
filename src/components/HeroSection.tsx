import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Snowflake, Mountains, Waves, Bicycle } from "@phosphor-icons/react";
import HeroVideoIndicators from "@/components/HeroVideoIndicators";

const SLIDE_DURATION = 5000;

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(1);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const backgrounds = [
    { type: 'video', url: '/vid/surfers_compressed_1920.mp4' },
    { type: 'video', url: '/vid/snowboarder_compressed_1920.mp4' },
    { type: 'video', url: '/vid/skier_compressed_1920.mp4' },
    { type: 'video', url: '/vid/surfer_compressed_1920.mp4' },
    { type: 'video', url: '/vid/mtb_compressed_2_1920.mp4' },
  ];

  const totalSlides = backgrounds.length;

  const goToNextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
    setProgress(1);
    setAnimationCycle((prev) => prev + 1);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(1);
    setAnimationCycle((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      goToNextSlide();
    }, SLIDE_DURATION);

    return () => clearTimeout(timeout);
  }, [goToNextSlide, activeIndex, animationCycle]);

  useEffect(() => {
    let frameId: number | null = null;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const remaining = Math.max(1 - elapsed / SLIDE_DURATION, 0);
      setProgress(remaining);

      if (remaining > 0) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [activeIndex, animationCycle]);

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
      {/* Rotating backgrounds */}
      {backgrounds.map((bg, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          {bg.type === 'video' ? (
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload={index === 0 ? "metadata" : "none"}
              aria-label={`Background video ${index + 1} of ${backgrounds.length}`}
              poster="https://images.unsplash.com/photo-1590461283969-47fedf408cfd?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              onError={(e) => {
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`Video failed to load: ${bg.url}`);
                }
                e.currentTarget.style.display = 'none';
              }}
            >
              <source src={bg.url} type="video/mp4" />
              <track kind="captions" srcLang="en" label="No audio - background video" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${bg.url}')` }}
            />
          )}
        </div>
      ))}
      
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-white">
        <div className="max-w-3xl text-center bg-zinc-900/60 p-4 rounded-lg shadow-lg">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-bold mb-4 text-primary" style={{ fontFamily: 'Tahoma, sans-serif' }}>
            DemoStoke
          </h1>
          <h2 className="text-2xl sm:text-4xl mb-8 max-w-2xl mx-auto text-shop">
            Find it. Ride it. Love it? Buy it.
          </h2>
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What can I help you find?"
                  className="pl-10 h-12 text-base bg-white/90 dark:bg-zinc-900/90 border-white/20 dark:border-zinc-700/50 text-foreground"
                />
              </div>
              <Button
                size="lg"
                onClick={() => handleSearch()}
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
      
      <HeroVideoIndicators
        count={backgrounds.length}
        activeIndex={activeIndex}
        progress={progress}
        onSelect={goToSlide}
      />
    </section>
  );
};

export default HeroSection;
