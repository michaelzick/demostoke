import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Search, ExternalLink } from "lucide-react";
import { Snowflake, Mountains, Waves, Bicycle, type Icon } from "@phosphor-icons/react";
import HeroVideoIndicators from "@/components/HeroVideoIndicators";
import { GEAR_CATEGORIES, type GearCategorySlug } from "@/lib/gearCategories";
import { RiptydeLink } from "@/components/RiptydeLink";

const SLIDE_DURATION = 5000;

const CATEGORY_ICONS: Record<GearCategorySlug, { icon: Icon; weight?: "fill" }> = {
  surfboards: { icon: Waves, weight: "fill" },
  snowboards: { icon: Snowflake, weight: "fill" },
  skis: { icon: Mountains, weight: "fill" },
  "mountain-bikes": { icon: Bicycle },
};

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(1);
  const [animationCycle, setAnimationCycle] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Surf-first: both surf clips lead the rotation.
  const backgrounds = [
    { type: 'video', url: '/vid/surfers_compressed_1920.mp4' },
    { type: 'video', url: '/vid/surfer_compressed_1920.mp4' },
    { type: 'video', url: '/vid/snowboarder_compressed_1920.mp4' },
    { type: 'video', url: '/vid/skier_compressed_1920.mp4' },
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
    <section className="relative h-[85vh] overflow-hidden">
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
        <div className="w-full max-w-3xl mx-auto text-center rounded-2xl border border-white/30 bg-[hsl(var(--background-dark)_/_0.4)] backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.55)] py-5 px-2.5 sm:py-8 sm:px-4">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 text-primary tracking-tight" style={{ fontFamily: 'Tahoma, sans-serif' }}>
            DemoStoke
          </h1>
          <h2 className="text-lg sm:text-2xl md:text-3xl mb-2 max-w-2xl mx-auto text-shop">
            Demo & Rent Surfboards From Local Shops and Shapers
          </h2>
          <p className="text-sm sm:text-base mb-1 text-white/70">
            Find it. Ride it. Love it? Buy it.
          </p>
          <p className="text-xs sm:text-sm mb-6 text-white/50">
            Also snowboards, skis, and mountain bikes.
          </p>
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What can I help you find?"
                  className="w-full pl-10 h-12 text-base bg-white/90 dark:bg-zinc-900/90 border-white/20 dark:border-zinc-700/50 text-foreground"
                />
              </div>
              <Button
                size="lg"
                onClick={() => handleSearch()}
                className="bg-primary hover:bg-primary/90 h-12 px-6 w-full sm:w-auto"
              >
                Search
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-8 justify-center">
            {GEAR_CATEGORIES.map((category) => {
              const { icon: CategoryIcon, weight } = CATEGORY_ICONS[category.slug];
              return (
                <Link
                  key={category.slug}
                  to={`/explore?category=${category.slug}`}
                  className="flex items-center gap-2 transition-transform transform hover:scale-105"
                >
                  <CategoryIcon className="h-6 w-6" weight={weight} />
                  <span className="text-sm font-medium">{category.label}</span>
                </Link>
              );
            })}
          </div>
          <RiptydeLink
            source="hero"
            iconSize={20}
            iconClassName="h-5 w-5 ring-1 ring-white/20 shadow-sm"
            className="group mt-6 text-xs sm:text-sm text-white/80 hover:text-white transition-colors"
          >
            <span className="underline-offset-4 group-hover:underline">Check the surf on Riptyde</span>
            <ExternalLink className="h-3.5 w-3.5 -ml-0.5" aria-hidden="true" />
          </RiptydeLink>
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
