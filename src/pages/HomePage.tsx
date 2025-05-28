
import { useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedGearSection from "@/components/home/FeaturedGearSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import CtaSection from "@/components/home/CtaSection";
import { mockEquipment } from "@/lib/mockData";

const HomePage = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get top rated equipment for the "Hot & Fresh" section
  const hotAndFreshEquipment = mockEquipment
    .sort((a, b) => parseFloat(b.rating.toString()) - parseFloat(a.rating.toString()))
    .slice(0, 3);

  // Get a mix of equipment for the "Featured Used Gear" section
  const featuredUsedGear = mockEquipment
    .filter((item, index, self) =>
      index === self.findIndex(t => t.category === item.category) || index < 6
    )
    .slice(3, 6);

  return (
    <div>
      <HeroSection />
      <HowItWorksSection />
      <FeaturedGearSection
        title="Trending"
        equipment={featuredUsedGear}
        />
      <FeaturedGearSection
        title="Fresh Picks"
        equipment={hotAndFreshEquipment}
        className="bg-white dark:bg-zinc-900"
      />
      <CategoriesSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;
