
const MapLegend = () => {
  const legendItems = [
    { category: 'Snowboards', color: 'bg-fuchsia-600' },
    { category: 'Skis', color: 'bg-lime-600' },
    { category: 'Surfboards', color: 'bg-blue-600' },
    { category: 'SUPs', color: 'bg-violet-600' },
    { category: 'Mountain Bikes', color: 'bg-red-600' },
  ];

  return (
    <div className="absolute top-4 left-4 z-10 bg-background/90 p-2 rounded-md backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        {legendItems.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded ${item.color}`} />
            <span className="text-xs font-medium">{item.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
