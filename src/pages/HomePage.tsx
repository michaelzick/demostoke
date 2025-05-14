
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Snowflake, Mountains, Waves, Fish, Skateboard } from "@phosphor-icons/react";
import { mockEquipment } from "@/lib/mockData";
import EquipmentCard from "@/components/EquipmentCard";

const HomePage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get featured equipment (a mix of top-rated items from each category)
  const featuredEquipment = mockEquipment
    .sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()))
    .filter((item, index, self) =>
      index === self.findIndex(t => t.category === item.category) || index < 6
    )
    .slice(0, 6);

  return (
    <div>
      <HeroSection />

      {/* How it Works Section */}
      <section className="py-16 bg-white">
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
                <MapPin className="h-8 w-8 text-ocean-DEFAULT" />
              </div>
              <h3 className="text-xl font-medium mb-2">Find Local Gear</h3>
              <p className="text-muted-foreground">
                Browse through available equipment in your area using our interactive map.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-ocean-light p-4 rounded-full mb-4">
                <Snowflake className="h-8 w-8 text-ocean-DEFAULT" weight="fill" />
              </div>
              <h3 className="text-xl font-medium mb-2">Request a Demo</h3>
              <p className="text-muted-foreground">
                Connect with the owner and arrange a time to try out the equipment.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="bg-ocean-light p-4 rounded-full mb-4">
                <Waves className="h-8 w-8 text-ocean-DEFAULT" weight="fill" />
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

      {/* Featured Equipment Section */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Gear</h2>
            <Button variant="outline" asChild>
              <Link to="/explore">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEquipment.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden group cursor-pointer">
              <div className="relative h-80">
                <img
                  src="https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80"
                  alt="Snowboards"
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Snowflake className="h-10 w-10 mb-2 mx-auto" weight="fill" />
                    <h3 className="text-2xl font-bold mb-2">Snow</h3>
                    <Button size="sm">
                      <Link to="/explore?category=snowboards">Explore</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden group cursor-pointer">
              <div className="relative h-80">
                <img
                  src="https://images.unsplash.com/photo-1531722569936-825d3dd91b15?auto=format&fit=crop&w=800&q=80"
                  alt="Surfboards"
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Waves className="h-10 w-10 mb-2 mx-auto" weight="fill" />
                    <h3 className="text-2xl font-bold mb-2">Surf</h3>
                    <Button size="sm">
                      <Link to="/explore?category=surfboards">Explore</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden group cursor-pointer">
              <div className="relative h-80">
                <img
                  src="https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80"
                  alt="Skateboards"
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Skateboard className="h-10 w-10 mb-2 mx-auto" weight="fill" />
                    <h3 className="text-2xl font-bold mb-2">Skate</h3>
                    <Button size="sm">
                      <Link to="/explore?category=skateboards">Explore</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-ocean-deep text-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Have Equipment to Share?</h2>
              <p className="text-lg mb-6">
                List your board or skis and earn money by letting others demo your gear.
              </p>
              <Link to="/list-gear">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/20 border-white"
                >
                  List Your Gear
                </Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 bg-white/10 rounded-full w-40 h-40 animate-float" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-4 -right-4 bg-white/10 rounded-full w-24 h-24 animate-float"></div>
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
    </div>
  );
};

export default HomePage;
