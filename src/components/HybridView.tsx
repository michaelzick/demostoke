import { memo, useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Equipment } from "@/types";
import CompactEquipmentCard from "./CompactEquipmentCard";
import MapLegend from "./map/MapLegend";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMapMarkers } from "@/hooks/useMapMarkers";
import mapboxgl from "mapbox-gl";
import { supabase } from "@/integrations/supabase/client";
import { initializeMap, fitMapBounds } from "@/utils/mapUtils";
import { UserLocation } from "@/hooks/useUserLocations";
import { getFilteredUserLocations } from "@/utils/equipmentLocationMapping";
import SortDropdown from "./SortDropdown";
import { useScrollToTopButton } from "@/hooks/useScrollToTopButton";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useAuth } from "@/contexts/auth";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDeleteEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  filterItemsByViewportBounds,
  MapViewportBounds,
} from "@/utils/mapViewportFiltering";

interface HybridViewProps {
  filteredEquipment: Equipment[];
  activeCategory: string | null;
  isLocationBased: boolean;
  userLocations?: UserLocation[];
  viewMode?: "map" | "list" | "hybrid";
  resetSignal?: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  showRelevanceOption?: boolean;
  emptyMessage?: string;
}

interface MapEquipment {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  location: {
    lat: number;
    lng: number;
  };
  ownerId: string;
  ownerName: string;
}

interface HybridMapPanelProps {
  activeCategory: string | null;
  viewMode: "map" | "list" | "hybrid";
  containerClassName: string;
  mapUserLocations: UserLocation[];
  selectedEquipment?: MapEquipment;
  resetSignal?: number;
  onViewportBoundsChange: (bounds: MapViewportBounds | null) => void;
}

const buildShopCameraKey = (mapUserLocations: UserLocation[]): string =>
  mapUserLocations
    .map(
      (user) =>
        `${user.id}:${user.location.lat.toFixed(6)}:${user.location.lng.toFixed(6)}`,
    )
    .sort()
    .join("|");

const readViewportBounds = (map: mapboxgl.Map): MapViewportBounds => {
  const bounds = map.getBounds();

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
};

const HybridMapPanel = memo(
  ({
    activeCategory,
    viewMode,
    containerClassName,
    mapUserLocations,
    selectedEquipment,
    resetSignal,
    onViewportBoundsChange,
  }: HybridMapPanelProps) => {
    const [mapboxToken, setMapboxToken] = useState<string | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const previousResetSignalRef = useRef(resetSignal);
    const lastAppliedCameraKeyRef = useRef<string | null>(null);
    const programmaticCameraChangeRef = useRef(false);
    const userAdjustedMapRef = useRef(false);

    const shopCameraKey = useMemo(
      () => buildShopCameraKey(mapUserLocations),
      [mapUserLocations],
    );

    const syncViewportBounds = useCallback(() => {
      if (!map.current) return;
      onViewportBoundsChange(readViewportBounds(map.current));
    }, [onViewportBoundsChange]);

    const applyCameraChange = useCallback(
      (cameraKey: string, action: (mapInstance: mapboxgl.Map) => void) => {
        if (!map.current) return;

        programmaticCameraChangeRef.current = true;
        action(map.current);
        lastAppliedCameraKeyRef.current = cameraKey;
      },
      [],
    );

    useEffect(() => {
      const fetchMapboxToken = async () => {
        try {
          const { data, error } = await supabase.functions.invoke("get-mapbox-token");
          if (error) throw error;
          setMapboxToken(data.token);
        } catch (err) {
          console.error("Error fetching Mapbox token:", err);
        }
      };

      fetchMapboxToken();
    }, []);

    useEffect(() => {
      if (!mapContainer.current || !mapboxToken) return;

      if (map.current) {
        map.current.remove();
        map.current = null;
      }

      setIsMapLoaded(false);
      lastAppliedCameraKeyRef.current = null;
      programmaticCameraChangeRef.current = false;
      userAdjustedMapRef.current = false;

      try {
        map.current = initializeMap(mapContainer.current, mapboxToken);
        map.current.on("load", () => {
          setIsMapLoaded(true);
        });
      } catch (err) {
        console.error("Error initializing map:", err);
      }

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [mapboxToken]);

    useMapMarkers({
      map: map.current,
      mapLoaded: isMapLoaded,
      equipment: selectedEquipment ? [selectedEquipment] : [],
      userLocations: selectedEquipment ? [] : mapUserLocations,
      isSingleView: false,
      activeCategory,
    });

    useEffect(() => {
      if (!map.current || !isMapLoaded) return;

      const mapInstance = map.current;
      const markUserAdjusted = () => {
        if (!programmaticCameraChangeRef.current) {
          userAdjustedMapRef.current = true;
        }
      };

      const handleMoveEnd = () => {
        syncViewportBounds();

        if (programmaticCameraChangeRef.current) {
          programmaticCameraChangeRef.current = false;
        }
      };

      mapInstance.on("moveend", handleMoveEnd);
      mapInstance.on("wheel", markUserAdjusted);
      mapInstance.on("dragstart", markUserAdjusted);
      mapInstance.on("zoomstart", markUserAdjusted);
      mapInstance.on("touchstart", markUserAdjusted);
      syncViewportBounds();

      return () => {
        mapInstance.off("moveend", handleMoveEnd);
        mapInstance.off("wheel", markUserAdjusted);
        mapInstance.off("dragstart", markUserAdjusted);
        mapInstance.off("zoomstart", markUserAdjusted);
        mapInstance.off("touchstart", markUserAdjusted);
      };
    }, [isMapLoaded, syncViewportBounds]);

    useEffect(() => {
      if (!map.current || !isMapLoaded) return;
      if (previousResetSignalRef.current === resetSignal) return;

      previousResetSignalRef.current = resetSignal;
      userAdjustedMapRef.current = false;

      if (mapUserLocations.length === 0) return;

      const cameraKey = `shops:${shopCameraKey}`;
      applyCameraChange(cameraKey, (mapInstance) => {
        fitMapBounds(mapInstance, mapUserLocations);
      });
    }, [
      applyCameraChange,
      isMapLoaded,
      mapUserLocations,
      resetSignal,
      shopCameraKey,
    ]);

    useEffect(() => {
      if (!map.current || !isMapLoaded || selectedEquipment) return;
      if (mapUserLocations.length === 0) return;

      const cameraKey = `shops:${shopCameraKey}`;

      if (
        userAdjustedMapRef.current &&
        lastAppliedCameraKeyRef.current === cameraKey
      ) {
        return;
      }

      if (lastAppliedCameraKeyRef.current === cameraKey) {
        return;
      }

      applyCameraChange(cameraKey, (mapInstance) => {
        fitMapBounds(mapInstance, mapUserLocations);
      });
    }, [
      applyCameraChange,
      isMapLoaded,
      mapUserLocations,
      selectedEquipment,
      shopCameraKey,
    ]);

    useEffect(() => {
      if (!map.current || !isMapLoaded || !selectedEquipment) return;

      const cameraKey = `gear:${selectedEquipment.id}`;
      if (lastAppliedCameraKeyRef.current === cameraKey) return;

      applyCameraChange(cameraKey, (mapInstance) => {
        mapInstance.flyTo({
          center: [selectedEquipment.location.lng, selectedEquipment.location.lat],
          zoom: 15,
          duration: 1000,
        });
      });
    }, [applyCameraChange, isMapLoaded, selectedEquipment]);

    return (
      <div className={containerClassName}>
        <div ref={mapContainer} className="w-full h-full" />
        <MapLegend activeCategory={activeCategory} viewMode={viewMode} />
      </div>
    );
  },
);

HybridMapPanel.displayName = "HybridMapPanel";

const HybridView = ({
  filteredEquipment,
  activeCategory,
  isLocationBased,
  userLocations = [],
  viewMode = "hybrid",
  resetSignal,
  sortBy,
  onSortChange,
  showRelevanceOption = false,
  emptyMessage,
}: HybridViewProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { toast } = useToast();
  const deleteEquipmentMutation = useDeleteEquipment();
  const updateVisibilityMutation = useUpdateEquipmentVisibility();
  const queryClient = useQueryClient();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [viewportBounds, setViewportBounds] = useState<MapViewportBounds | null>(
    null,
  );
  const listRef = useRef<HTMLDivElement>(null);
  const desktopListRef = useRef<HTMLDivElement>(null);
  const previousResetSignalRef = useRef(resetSignal);

  const { showButton: showMobileScrollButton, scrollToTop: scrollMobileToTop } =
    useScrollToTopButton({
      threshold: 200,
    });

  const {
    showButton: showDesktopScrollButton,
    scrollToTop: scrollDesktopToTop,
  } = useScrollToTopButton({
    threshold: 200,
    containerRef: desktopListRef,
  });

  const handleViewportBoundsChange = useCallback(
    (bounds: MapViewportBounds | null) => {
      setViewportBounds(bounds);
    },
    [],
  );

  const allHybridEquipment = filteredEquipment;

  const mapEquipment: MapEquipment[] = useMemo(
    () =>
      allHybridEquipment
        .filter((item) => item.location?.lat && item.location?.lng)
        .map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price_per_day: item.price_per_day,
          location: {
            lat: item.location.lat,
            lng: item.location.lng,
          },
          ownerId: item.owner.id,
          ownerName: item.owner.name,
        })),
    [allHybridEquipment],
  );

  const filteredUserLocationsByEquipment = useMemo(
    () => getFilteredUserLocations(allHybridEquipment, userLocations),
    [allHybridEquipment, userLocations],
  );

  const mapUserLocations = useMemo(
    () =>
      filteredUserLocationsByEquipment.filter(
        (user) => user.location?.lat && user.location?.lng,
      ),
    [filteredUserLocationsByEquipment],
  );

  const selectedEquipment = useMemo(
    () =>
      selectedEquipmentId
        ? mapEquipment.find((item) => item.id === selectedEquipmentId)
        : undefined,
    [mapEquipment, selectedEquipmentId],
  );

  const visibleOwnerIds = useMemo(() => {
    if (selectedEquipmentId) {
      return new Set<string>();
    }

    return new Set(
      filterItemsByViewportBounds(mapUserLocations, viewportBounds).map(
        (user) => user.id,
      ),
    );
  }, [mapUserLocations, selectedEquipmentId, viewportBounds]);

  const visibleHybridEquipment = useMemo(() => {
    if (selectedEquipmentId) {
      return allHybridEquipment.filter((item) => item.id === selectedEquipmentId);
    }

    return allHybridEquipment.filter((item) => visibleOwnerIds.has(item.owner.id));
  }, [allHybridEquipment, selectedEquipmentId, visibleOwnerIds]);

  useEffect(() => {
    if (previousResetSignalRef.current === resetSignal) return;

    previousResetSignalRef.current = resetSignal;
    setSelectedEquipmentId(null);
  }, [resetSignal]);

  const resolvedEmptyMessage =
    emptyMessage || "Try changing your filters or explore a different category.";
  const mapAreaEmptyMessage = "No gear in this map area. Move the map or zoom out.";
  const hasViewportResults = visibleHybridEquipment.length > 0;
  const hasAnyHybridResults = allHybridEquipment.length > 0;
  const hybridEmptyMessage = hasAnyHybridResults
    ? mapAreaEmptyMessage
    : resolvedEmptyMessage;

  const handleEquipmentCardClick = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);

    if (isMobile) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (equipmentId: string) => {
    try {
      await deleteEquipmentMutation.mutateAsync(equipmentId);
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Equipment Deleted",
        description: "Equipment has been successfully deleted.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete equipment.",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityToggle = async (
    equipmentId: string,
    currentVisibility: boolean,
  ) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        equipmentId,
        visible: !currentVisibility,
      });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Visibility Updated",
        description: `Equipment is now ${
          !currentVisibility ? "visible" : "hidden"
        } on the map.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update visibility.",
        variant: "destructive",
      });
    }
  };

  const handleCardWrapperClick = (
    e: React.MouseEvent,
    equipmentId: string,
  ) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.tagName === "BUTTON" || target.closest("a, button")) {
      return;
    }

    handleEquipmentCardClick(equipmentId);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen">
        <HybridMapPanel
          activeCategory={activeCategory}
          viewMode={viewMode}
          containerClassName="h-[50vh] relative"
          mapUserLocations={mapUserLocations}
          selectedEquipment={selectedEquipment}
          resetSignal={resetSignal}
          onViewportBoundsChange={handleViewportBoundsChange}
        />

        <div ref={listRef} className="p-4">
          <div className="mb-4 flex flex-col gap-3">
            {isLocationBased && (
              <div className="text-sm text-muted-foreground">
                Distances calculated from your location
              </div>
            )}
            {hasAnyHybridResults && (
              <div className="text-sm text-muted-foreground">
                Showing {visibleHybridEquipment.length} of {allHybridEquipment.length} gear in this map area
              </div>
            )}
            <div className="w-full mt-2">
              <SortDropdown
                sortBy={sortBy}
                onSortChange={onSortChange}
                showRelevanceOption={showRelevanceOption}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleHybridEquipment.map((equipment) => (
              <div
                key={equipment.id}
                id={`equipment-card-${equipment.id}`}
                className={`transition-all duration-300 rounded-lg hover:shadow-md cursor-pointer ${
                  selectedEquipmentId === equipment.id
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
                onClick={(e) => handleCardWrapperClick(e, equipment.id)}
              >
                <CompactEquipmentCard
                  equipment={equipment}
                  showActions={!!(user && (equipment.owner.id === user.id || isAdmin))}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  onDelete={handleDelete}
                  onVisibilityToggle={handleVisibilityToggle}
                />
              </div>
            ))}
          </div>
          {!hasViewportResults && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground">{hybridEmptyMessage}</p>
            </div>
          )}

          <ScrollToTopButton
            show={showMobileScrollButton}
            onClick={scrollMobileToTop}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex">
      <div ref={desktopListRef} className="w-3/5 overflow-y-auto p-4">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {isLocationBased && (
            <div className="text-sm text-muted-foreground">
              Distances calculated from your location
            </div>
          )}
          {hasAnyHybridResults && (
            <div className="text-sm text-muted-foreground">
              Showing {visibleHybridEquipment.length} of {allHybridEquipment.length} gear in this map area
            </div>
          )}
          <div className="w-full lg:w-auto lg:ml-auto mt-2 lg:mt-0">
            <SortDropdown
              sortBy={sortBy}
              onSortChange={onSortChange}
              showRelevanceOption={showRelevanceOption}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleHybridEquipment.map((equipment) => (
            <div
              key={equipment.id}
              id={`equipment-card-${equipment.id}`}
              className={`transition-all duration-300 cursor-pointer rounded-lg hover:shadow-md ${
                selectedEquipmentId === equipment.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
              onClick={(e) => handleCardWrapperClick(e, equipment.id)}
            >
              <CompactEquipmentCard
                equipment={equipment}
                showActions={!!(user && (equipment.owner.id === user.id || isAdmin))}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onDelete={handleDelete}
                onVisibilityToggle={handleVisibilityToggle}
              />
            </div>
          ))}
          {!hasViewportResults && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground">{hybridEmptyMessage}</p>
            </div>
          )}
        </div>

        <ScrollToTopButton
          show={showDesktopScrollButton}
          onClick={scrollDesktopToTop}
        />
      </div>

      <HybridMapPanel
        activeCategory={activeCategory}
        viewMode={viewMode}
        containerClassName="w-2/5 relative"
        mapUserLocations={mapUserLocations}
        selectedEquipment={selectedEquipment}
        resetSignal={resetSignal}
        onViewportBoundsChange={handleViewportBoundsChange}
      />
    </div>
  );
};

export default HybridView;
