type HeroVideoIndicatorsProps = {
  count: number;
  activeIndex: number;
  progress: number;
  onSelect: (index: number) => void;
};

const HeroVideoIndicators = ({
  count,
  activeIndex,
  progress,
  onSelect,
}: HeroVideoIndicatorsProps) => {
  if (count <= 0) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;
        const fillAmount = isActive ? progress : 1;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`relative h-[10px] overflow-hidden rounded-full border border-white/70 bg-white/10 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              isActive ? "w-16 sm:w-20 opacity-100" : "w-10 sm:w-12 opacity-75"
            }`}
            aria-label={`Show background video ${index + 1}`}
            aria-pressed={isActive}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-white/80 via-white/60 to-white/45 origin-right will-change-transform"
              style={{
                transform: `scaleX(${fillAmount})`,
                transition: isActive
                  ? "transform 0.1s linear"
                  : "transform 0.3s ease-out",
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default HeroVideoIndicators;
