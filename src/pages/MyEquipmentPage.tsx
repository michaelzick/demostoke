import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Copy,
  MapPin,
  CalendarDays,
  Star,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUserEquipment, useDeleteEquipment, useUpdateEquipmentVisibility } from "@/hooks/useUserEquipment";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useAuth } from "@/helpers";

const MyEquipmentPage = () => {
  usePageMetadata({
    title: 'My Equipment | DemoStoke',
    description: 'Manage your equipment listings on DemoStoke.'
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

  const { data: equipment, isLoading, error } = useUserEquipment(user?.id);
  const deleteEquipmentMutation = useDeleteEquipment();
  const updateVisibilityMutation = useUpdateEquipmentVisibility();

  const handleDelete = async (equipmentId: string, equipmentName: string) => {
    if (window.confirm(`Are you sure you want to delete "${equipmentName}"? This action cannot be undone.`)) {
      try {
        await deleteEquipmentMutation.mutateAsync(equipmentId);
        toast({
          title: "Equipment Deleted",
          description: `${equipmentName} has been successfully deleted.`,
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete equipment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleVisibilityToggle = async (equipmentId: string, currentVisibility: boolean, equipmentName: string) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        equipmentId,
        visible: !currentVisibility
      });

      toast({
        title: "Visibility Updated",
        description: `${equipmentName} is now ${!currentVisibility ? 'visible' : 'hidden'} on the map.`,
      });
    } catch (error) {
      console.error('Visibility toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = (equipmentItem: any) => {
    const duplicateData = {
      name: equipmentItem.name,
      category: equipmentItem.category,
      description: equipmentItem.description,
      location_address: equipmentItem.location?.address || '', // Changed from zip to address
      size: equipmentItem.specifications?.size || '',
      weight: equipmentItem.specifications?.weight || '',
      material: equipmentItem.specifications?.material || '',
      suitable_skill_level: equipmentItem.specifications?.suitable || '',
      price_per_day: equipmentItem.price_per_day,
      damage_deposit: equipmentItem.damage_deposit || 0,
      image_url: equipmentItem.image_url
    };

    sessionStorage.setItem('duplicateGearData', JSON.stringify(duplicateData));
    navigate('/list-your-gear/add-gear-form');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">Please sign in</h2>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your equipment.
          </p>
          <Button onClick={() => navigate("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 mt-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-xl font-medium mb-2">Error loading equipment</h2>
          <p className="text-muted-foreground mb-6">
            There was an error loading your equipment. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const filteredEquipment = equipment?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesVisibility = visibilityFilter === "all" ||
      (visibilityFilter === "visible" && item.visible_on_map) ||
      (visibilityFilter === "hidden" && !item.visible_on_map);

    return matchesSearch && matchesCategory && matchesVisibility;
  }) || [];

  const categories = [...new Set(equipment?.map(item => item.category) || [])];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Equipment</h1>
          <p className="text-muted-foreground">
            Manage your equipment listings and track their performance
          </p>
        </div>
        <Button asChild>
          <Link to="/list-your-gear">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="equipment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Items</option>
                <option value="visible">Visible Only</option>
                <option value="hidden">Hidden Only</option>
              </select>
            </div>
          </div>

          {/* Equipment Grid */}
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-medium mb-2">No equipment found</h3>
              <p className="text-muted-foreground mb-6">
                {equipment?.length === 0
                  ? "You haven't added any equipment yet. Start by adding your first item!"
                  : "No equipment matches your current filters."
                }
              </p>
              {equipment?.length === 0 && (
                <Button asChild>
                  <Link to="/add-gear">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Equipment
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => {
                // Handle both single image_url and multiple images array - ensure we always have an array
                const images = item.images && item.images.length > 0
                  ? item.images
                  : item.image_url
                    ? [item.image_url]
                    : [];

                const hasMultipleImages = images.length > 1;
                const hasImages = images.length > 0;

                return (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="aspect-square relative overflow-hidden rounded-md mb-4">
                        {hasImages ? (
                          hasMultipleImages ? (
                            <Carousel className="w-full h-full" opts={{ loop: true }}>
                              <CarouselContent>
                                {images.map((imageUrl, index) => (
                                  <CarouselItem key={index}>
                                    <img
                                      src={imageUrl}
                                      alt={`${item.name} - Image ${index + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                              <CarouselPrevious className="left-2" />
                              <CarouselNext className="right-2" />
                            </Carousel>
                          ) : (
                            <img
                              src={images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">No image available</span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant={item.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                            {item.status}
                          </Badge>
                          {!item.visible_on_map && (
                            <Badge className="text-xs text-gray-900 bg-rose-500 hover:bg-rose-500">
                              <EyeOff className="h-3 w-3 mr-1 text-gray-900" />
                              Hidden
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link to={`/equipment/${item.id}`}>
                          <CardTitle className="text-lg line-clamp-1 hover:text-primary transition-colors">{item.name}</CardTitle>
                        </Link>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="capitalize">{item.category}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating}</span>
                            <span>({item.review_count})</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-2">
                      <div className="space-y-3">
                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-lg font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {item.price_per_day}/day
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{item.location.address}</span>
                        </div>

                        {/* Actions */}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVisibilityToggle(item.id, item.visible_on_map, item.name)}
                              disabled={updateVisibilityMutation.isPending}
                            >
                              {item.visible_on_map ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Commenting out till duplicate functionality is implemented */}
                            {/* <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleDuplicate(item)}
                           >
                             <Copy className="h-4 w-4" />
                           </Button> */}

                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link to={`/edit-gear/${item.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.name)}
                              disabled={deleteEquipmentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button size="sm" asChild>
                            <Link to={`/equipment/${item.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="py-6">
            <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Here you can view detailed analytics about your equipment listings.
            </p>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">No data available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">No data available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0</p>
                  <p className="text-sm text-muted-foreground">No data available</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default MyEquipmentPage;
