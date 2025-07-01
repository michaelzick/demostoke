
import { useState, useEffect } from "react";
import usePageMetadata from "@/hooks/usePageMetadata";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HCaptcha from "@/components/HCaptcha";
import { RequiredIndicator } from "@/components/waiver/RequiredIndicator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactUsPage = () => {
  usePageMetadata({
    title: 'Contact Us | DemoStoke',
    description: 'Get in touch with the DemoStoke team.'
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };

  // Check if all required fields are filled and captcha is completed
  const isFormValid = formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.subject &&
    formData.message &&
    captchaToken;

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

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: ""
      });
      setCaptchaToken("");

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
          <CardDescription>
            Get in touch with the DemoStoke team. We'd love to hear from you!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name
                  <RequiredIndicator />
                </Label>
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
                <Label htmlFor="lastName">
                  Last Name
                  <RequiredIndicator />
                </Label>
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
              <Label htmlFor="email">
                Email Address
                <RequiredIndicator />
              </Label>
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
              <Label htmlFor="subject">
                Subject
                <RequiredIndicator />
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief description of your inquiry"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Message
                <RequiredIndicator />
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us how we can help you..."
                className="min-h-[120px]"
                required
              />
            </div>

            <HCaptcha
              siteKey="e30661ca-467c-43cc-899c-be56ab28c2a2"
              onVerify={handleCaptchaVerify}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send It!"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactUsPage;
