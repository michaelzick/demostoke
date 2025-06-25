
import React from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GearImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  equipmentName: string;
}

const GearImageModal: React.FC<GearImageModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  equipmentName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black/95">
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 text-white hover:bg-white/20 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogClose>
        
        <div className="w-full h-full flex items-center justify-center p-4">
          {images.length > 1 ? (
            <Carousel 
              className="w-full max-w-3xl" 
              opts={{ 
                loop: true,
                startIndex: initialIndex 
              }}
            >
              <CarouselContent>
                {images.map((imageUrl, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square w-full max-h-[80vh] flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={`${equipmentName} - Image ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 text-white bg-black/50 hover:bg-black/70 border-white/20" />
              <CarouselNext className="right-4 text-white bg-black/50 hover:bg-black/70 border-white/20" />
            </Carousel>
          ) : (
            <div className="aspect-square w-full max-h-[80vh] flex items-center justify-center">
              <img
                src={images[0]}
                alt={equipmentName}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GearImageModal;
