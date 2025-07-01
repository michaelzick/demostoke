
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
    event_date: null,
    event_time: null,
    location: null,
    equipment_available: null,
    company: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        gear_category: editEvent.gear_category,
        event_date: editEvent.event_date,
        event_time: editEvent.event_time,
        location: editEvent.location,
        equipment_available: editEvent.equipment_available,
        company: editEvent.company || '',
      });
    } else {
      setFormData({
        title: '',
        gear_category: 'snowboards',
        event_date: null,
        event_time: null,
        location: null,
        equipment_available: null,
        company: '',
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

    // Clean up empty string values to null
    const cleanedData = {
      ...formData,
      event_date: formData.event_date?.trim() || null,
      event_time: formData.event_time?.trim() || null,
      location: formData.location?.trim() || null,
      equipment_available: formData.equipment_available?.trim() || null,
      company: formData.company?.trim() || '',
    };

    onSubmit(cleanedData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      gear_category: 'snowboards',
      event_date: null,
      event_time: null,
      location: null,
      equipment_available: null,
      company: '',
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
            <Label htmlFor="gear_category">Gear Category *</Label>
            <Select
              value={formData.gear_category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, gear_category: value as any }))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value || null }))}
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.event_time || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value || null }))}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value || null }))}
              placeholder="Enter event location"
            />
          </div>

          <div>
            <Label htmlFor="equipment">Notes or Equipment Available</Label>
            <Textarea
              id="equipment"
              value={formData.equipment_available || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment_available: e.target.value || null }))}
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
