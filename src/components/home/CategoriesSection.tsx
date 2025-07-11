
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Snowflake, Waves, Bike } from "lucide-react";

const CategoriesSection = () => {
  return (
    <section className="py-16 bg-white dark:bg-zinc-900">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden group cursor-pointer">
            <div className="relative h-80">
              <img
                src="https://images.unsplash.com/photo-1518608774889-b04d2abe7702?auto=format&fit=crop&w=800&q=80"
                alt="Snowboards"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <Snowflake className="h-10 w-10 mb-2 mx-auto" />
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
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <Waves className="h-10 w-10 mb-2 mx-auto" />
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
                src="https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80"
                alt="Mountain Bikes"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <Bike className="h-10 w-10 mb-2 mx-auto" />
                  <h3 className="text-2xl font-bold mb-2">Bike</h3>
                  <Button size="sm">
                    <Link to="/explore?category=mountain-bikes">Explore</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
