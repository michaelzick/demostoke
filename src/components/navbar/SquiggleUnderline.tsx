
const SquiggleUnderline = () => {
  return (
    <svg
      className="absolute -bottom-1 left-0 w-full h-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      viewBox="0 0 100 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M2 4C10 2 20 6 30 4C40 2 50 6 60 4C70 2 80 6 90 4C95 3 98 4 98 4"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default SquiggleUnderline;
