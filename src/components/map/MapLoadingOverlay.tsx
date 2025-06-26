
interface MapLoadingOverlayProps {
  isLoadingToken: boolean;
  userLocationsLoading: boolean;
  isUserLocationMode: boolean;
}

const MapLoadingOverlay = ({ isLoadingToken, userLocationsLoading, isUserLocationMode }: MapLoadingOverlayProps) => {
  if (isLoadingToken) {
    return (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-20">
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-400" />
        </div>
      </div>
    );
  }

  if (isUserLocationMode && userLocationsLoading) {
    return (
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400" />
          Loading user locations...
        </div>
      </div>
    );
  }

  return null;
};

export default MapLoadingOverlay;
