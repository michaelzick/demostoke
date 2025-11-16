
import { useState, useEffect, useRef } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import FeaturedGearSection from "@/components/home/FeaturedGearSection";
import FeaturedPostsSection from "@/components/home/FeaturedPostsSection";
import FeaturedEventsSection from "@/components/home/FeaturedEventsSection";
import RecentlyViewedGearSection from "@/components/home/RecentlyViewedGearSection";
import { useTrendingEquipment } from "@/hooks/useTrendingEquipment";
import { useAuth } from "@/contexts/auth";
import { useRecentEquipment } from "@/hooks/useRecentEquipment";
import { useFeaturedEquipment } from "@/hooks/useFeaturedEquipment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmailChangeDialog } from "@/components/EmailChangeDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import HCaptcha from "@/components/HCaptcha";
import { safeLocalStorage } from "@/utils/ssrSafe";

const HomePage = () => {
  usePageMetadata({
    title: 'DemoStoke | Find it. Ride it. Love it? Buy it.',
    description: 'DemoStoke is the go-to platform to find, try, and buy the gear you\'ll eventually fall in love with.'
  });

  // Client-only state
  const [mounted, setMounted] = useState(false);
  
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch trending, recent, and featured equipment
  const { data: trendingEquipment, isLoading: trendingLoading } = useTrendingEquipment();
  const { data: recentEquipment, isLoading: recentLoading } = useRecentEquipment();
  const { data: featuredEquipment, isLoading: featuredLoading } = useFeaturedEquipment();

  // Modal state and localStorage logic
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!mounted) return;

    const dontShow = safeLocalStorage.getItem("hideEmailModal");
    const sent = safeLocalStorage.getItem("emailModalSent");
    // Not showing the modal for now. Uncomment to show it.
    // if (!dontShow && !sent) {
    //   timerRef.current = setTimeout(() => setShowModal(true), 3000);
    // }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.subject &&
    formData.message &&
    captchaToken;

  const handleDontShowAgain = () => {
    safeLocalStorage.setItem("hideEmailModal", "1");
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and complete the captcha.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting contact form with data:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subject: formData.subject,
        messageLength: formData.message.length,
        hasCaptcha: !!captchaToken
      });

      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          subject: `[DemoStoke] ${formData.subject}`,
          message: formData.message,
          captchaToken
        }
      });

      console.log("Function response:", { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      toast({
        title: "Success",
        description: "Your message has been sent successfully. We'll get back to you soon!",
      });

      // Mark modal as sent in localStorage
      handleDontShowAgain();

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
      setCaptchaToken("");
      setShowModal(false); // Close the modal on success

    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Email Change Dialog */}
      <EmailChangeDialog />

      {/* Email Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>This site is under active development.</DialogTitle>
            <DialogDescription>
              If you'd like to be notified when it's fully functional, please fill out the form below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <HCaptcha siteKey="e30661ca-467c-43cc-899c-be56ab28c2a2" onVerify={handleCaptchaVerify} />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDontShowAgain}
                disabled={isSubmitting}
              >
                Don't Show Again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? "Sending..." : "Send It!"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <HeroSection />
      <FeaturedEventsSection />
      <HowItWorksSection />
      <RecentlyViewedGearSection userId={user?.id} />

      {/* Featured section with admin-selected equipment */}
      {!featuredLoading && featuredEquipment && featuredEquipment.length > 0 && (
        <FeaturedGearSection
          title="Featured Gear"
          equipment={featuredEquipment}
        />
      )}

      {/* Conditionally render trending section only if we have trending data */}
      {!trendingLoading && trendingEquipment && trendingEquipment.length > 0 && (
        <FeaturedGearSection
          title="Trending"
          equipment={trendingEquipment}
          className="bg-white dark:bg-muted/20"
        />
      )}

      {/* Fresh Picks section with recent equipment */}
      {!recentLoading && recentEquipment && recentEquipment.length > 0 && (
        <FeaturedGearSection
          title="Fresh Picks"
          equipment={recentEquipment}
          className="bg-white dark:bg-muted/20"
        />
      )}

      <FeaturedPostsSection />
    </div>
  );
};

export default HomePage;
