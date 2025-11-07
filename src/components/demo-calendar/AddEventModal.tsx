import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsAdmin } from "@/hooks/useUserRole";
import { useDemoEvents } from "@/hooks/useDemoEvents";
import { useToast } from "@/hooks/use-toast";
import { DemoEvent, DemoEventInput } from "@/types/demo-calendar";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (eventData: DemoEventInput) => void;
  editEvent?: DemoEvent | null;
  isSubmitting?: boolean;
}

const gearCategories = [
  { value: 'snowboards', label: 'Snowboards' },
  { value: 'skis', label: 'Skis' },
  { value: 'surfboards', label: 'Surfboards' },
  { value: 'mountain-bikes', label: 'Mountain Bikes' },
];

const AddEventModal = ({ open, onClose, onSubmit, editEvent, isSubmitting }: AddEventModalProps) => {
  const [formData, setFormData] = useState<DemoEventInput>({
    title: '',
    gear_category: 'snowboards',
    event_date: '',
    event_time: '',
    location: '',
    location_lat: null,
    location_lng: null,
    equipment_available: '',
    company: '',
    thumbnail_url: '',
    is_featured: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isAdmin } = useIsAdmin();
  const { events } = useDemoEvents();
  const { toast } = useToast();
  const featuredCount = (events || []).filter((e) => e.is_featured).length;
  const canFeatureMore = featuredCount < 3 || !!editEvent?.is_featured;

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        gear_category: editEvent.gear_category,
        event_date: editEvent.event_date || '',
        event_time: editEvent.event_time || '',
        location: editEvent.location || '',
        location_lat: editEvent.location_lat || null,
        location_lng: editEvent.location_lng || null,
        equipment_available: editEvent.equipment_available || '',
        company: editEvent.company || '',
        thumbnail_url: editEvent.thumbnail_url || '',
        is_featured: !!editEvent.is_featured,
      });
    } else {
      setFormData({
        title: '',
        gear_category: 'snowboards',
        event_date: '',
        event_time: '',
        location: '',
        location_lat: null,
        location_lng: null,
        equipment_available: '',
        company: '',
        thumbnail_url: '',
        is_featured: false,
      });
    }
    setErrors({});
  }, [editEvent, open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.gear_category) {
      newErrors.gear_category = 'Gear category is required';
    }

    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Enforce max 3 featured events
    if (isAdmin && formData.is_featured && !canFeatureMore) {
      toast({
        title: "Limit reached",
        description: "You can feature up to 3 events. Unfeature one to add another.",
        variant: "destructive",
      });
      return;
    }

    // Clean up empty string values to null
    const cleanedData: DemoEventInput = {
      ...formData,
      event_date: formData.event_date?.trim() || null,
      event_time: formData.event_time?.trim() || null,
      location: formData.location?.trim() || null,
      location_lat: formData.location_lat,
      location_lng: formData.location_lng,
      equipment_available: formData.equipment_available?.trim() || null,
      company: formData.company?.trim() || '',
      thumbnail_url: formData.thumbnail_url?.trim() || null,
      is_featured: isAdmin ? !!formData.is_featured : false,
    };

    onSubmit(cleanedData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      gear_category: 'snowboards',
      event_date: '',
      event_time: '',
      location: '',
      location_lat: null,
      location_lng: null,
      equipment_available: '',
      company: '',
      thumbnail_url: '',
      is_featured: false,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Enter hosting company"
              className={errors.company ? 'border-destructive' : ''}
            />
            {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
          </div>

          <div>
            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
            <Input
              id="thumbnail_url"
              value={formData.thumbnail_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground mt-1">Used for the homepage featured events section.</p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_featured"
                checked={!!formData.is_featured}
                disabled={!canFeatureMore && !formData.is_featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: !!checked }))}
              />
              <Label htmlFor="is_featured" className="text-sm">
                Featured on homepage {!canFeatureMore && !formData.is_featured ? '(max 3 reached)' : ''}
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="gear_category">Gear Category *</Label>
            <Select
              value={formData.gear_category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gear_category: value as DemoEventInput["gear_category"] }))}
            >
              <SelectTrigger className={errors.gear_category ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gearCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gear_category && <p className="text-sm text-destructive mt-1">{errors.gear_category}</p>}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.event_date || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value || '' }))}
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.event_time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value || '' }))}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value || '' }))}
              placeholder="Enter event location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location_lat">Latitude</Label>
              <Input
                id="location_lat"
                type="number"
                step="any"
                value={formData.location_lat || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location_lat: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="40.7128"
              />
              <p className="text-xs text-muted-foreground mt-1">For proximity filter</p>
            </div>
            <div>
              <Label htmlFor="location_lng">Longitude</Label>
              <Input
                id="location_lng"
                type="number"
                step="any"
                value={formData.location_lng || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location_lng: e.target.value ? parseFloat(e.target.value) : null }))}
                placeholder="-74.0060"
              />
              <p className="text-xs text-muted-foreground mt-1">For proximity filter</p>
            </div>
          </div>

          <div>
            <Label htmlFor="equipment">Notes or Equipment Available</Label>
            <Textarea
              id="equipment"
              value={formData.equipment_available || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment_available: e.target.value || '' }))}
              placeholder="List available equipment or additional notes"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : (editEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;
