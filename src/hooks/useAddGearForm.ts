
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/helpers";
import { useGearFormState } from "@/hooks/gear-form/useGearFormState";
import { useDuplicatedGearData } from "@/hooks/gear-form/useDuplicatedGearData";
import { useGearFormSubmission } from "@/hooks/gear-form/useGearFormSubmission";

export const useAddGearForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [duplicatedImageUrl, setDuplicatedImageUrl] = useState<string | undefined>();

  const formState = useGearFormState();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to list your gear.",
        variant: "destructive",
      });
      navigate("/auth/signin");
    }
  }, [isAuthenticated, navigate, toast]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle duplicated gear data
  const { getDuplicatedGearData } = useDuplicatedGearData({
    setGearName: formState.setGearName,
    setGearType: formState.setGearType,
    setDescription: formState.setDescription,
    setZipCode: formState.setZipCode,
    setMeasurementUnit: formState.setMeasurementUnit,
    setDimensions: formState.setDimensions,
    setRole: formState.setRole,
    setSkillLevel: formState.setSkillLevel,
    setPricePerDay: formState.setPricePerDay,
    setPricePerHour: formState.setPricePerHour,
    setPricePerWeek: formState.setPricePerWeek,
    setDamageDeposit: formState.setDamageDeposit,
  });

  // Get duplicated image URL if available
  useEffect(() => {
    const duplicatedData = getDuplicatedGearData();
    if (duplicatedData?.image_url) {
      setDuplicatedImageUrl(duplicatedData.image_url);
    }
  }, [getDuplicatedGearData]);

  // Handle form submission with individual price fields
  const { handleSubmit, isSubmitting } = useGearFormSubmission({
    gearName: formState.gearName,
    gearType: formState.gearType,
    description: formState.description,
    zipCode: formState.zipCode,
    measurementUnit: formState.measurementUnit,
    dimensions: formState.dimensions,
    skillLevel: formState.skillLevel,
    images: formState.images,
    pricePerDay: formState.pricePerDay,
    pricePerHour: formState.pricePerHour,
    pricePerWeek: formState.pricePerWeek,
    damageDeposit: formState.damageDeposit,
    role: formState.role,
    duplicatedImageUrl,
    imageUrl: formState.imageUrl,
    useImageUrl: formState.useImageUrl,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      formState.setImages(Array.from(e.target.files));
    }
  };

  const handleCancel = () => {
    navigate("/list-your-gear");
  };

  return {
    isAuthenticated,
    formState,
    handlers: {
      handleImageUpload,
      handleSubmit,
      handleCancel,
    },
    isSubmitting,
    duplicatedImageUrl,
  };
};
