
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import EquipmentCard from "@/components/EquipmentCard";
import { Equipment } from "@/types";

interface FeaturedGearSectionProps {
  title: string;
  equipment: Equipment[];
  className?: string;
}

const FeaturedGearSection = ({ title, equipment, className = "bg-ocean-deep text-white" }: FeaturedGearSectionProps) => {
  return (
    <section className={`py-12 ${className}`}>
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <Button
            variant="outline"
            size="lg"
            className="bg-white/20 dark:bg-zinc-900/50 dark:border-white border-zinc-600 dark:hover:bg-white/30 dark:hover:bg-zinc-500/40 transition-colors"
            asChild
          >
            <Link to="/explore">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGearSection;
