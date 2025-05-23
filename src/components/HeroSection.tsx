import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Snowflake, Mountains, Waves, Fish, Tire } from "@phosphor-icons/react";

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const backgrounds = [
    { type: 'video', url: 'https://www.dropbox.com/scl/fi/znvzshm1g7gwytbygnvsn/Surfers.mp4?rlkey=r3kw9ko4dm15mha24ip82ois7&st=g08p2e11&dl&raw=1' },
    { type: 'video', url: 'https://www.dropbox.com/scl/fi/2z56g1a3wpvi7zl46on79/Snowboarder.mp4?rlkey=xi0b1w4v9j0gwdpc5y6mgxzwv&st=d4f16c2k&raw=1' },
    { type: 'video', url: 'https://www.dropbox.com/scl/fi/l3cqbblgh8evbkmnjpi5q/Skier.mp4?rlkey=cmwlcovje2nh4rh11z1nmegbl&st=pnkaurog&raw=1' },
    { type: 'video', url: "https://www.dropbox.com/scl/fi/31247kpb1rm8eajxcvc2c/Skater.mp4?rlkey=thzgifp8h6m8w65ujexrtegmh&st=6lgbs5o2&dl&raw=1" },
    { type: 'video', url: 'https://www.dropbox.com/scl/fi/a6m98u09ylz1y9cenu5o0/SUP.mp4?rlkey=3a134qh2ah5ouvw3z6r5jp018&st=qrsyvz2p&dl&raw=1' },
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
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4">
            DemoStoke
          </h1>
          <h2 className="text-xl sm:text-3xl mb-8 max-w-2xl mx-auto">
            Ride what makes you feel alive.
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Button size="lg" asChild className='bg-primary'>
              <Link to="/explore">Find Gear Near Me</Link>
            </Button>
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
              to="/explore?category=sups"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Fish className="h-6 w-6" weight="fill" />
              <span className="text-sm font-medium">SUPs</span>
            </Link>
            <Link
              to="/explore?category=skateboards"
              className="flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <Tire className="h-6 w-6" weight="fill" />
              <span className="text-sm font-medium">Skateboards</span>
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
