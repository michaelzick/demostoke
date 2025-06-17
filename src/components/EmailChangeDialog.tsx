
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

export const EmailChangeDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlMessage = urlParams.get("message");
    
    if (urlMessage) {
      setMessage(decodeURIComponent(urlMessage));
      
      // Check if this is a successful email change completion
      const isEmailChangeComplete = urlMessage.toLowerCase().includes("email") && 
        (urlMessage.toLowerCase().includes("updated") || 
         urlMessage.toLowerCase().includes("changed") ||
         urlMessage.toLowerCase().includes("confirmed"));
      
      setIsSuccess(isEmailChangeComplete);
      setIsOpen(true);
    }
  }, [location.search]);

  const handleClose = () => {
    setIsOpen(false);
    // Clean up the URL by removing the message parameter
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete("message");
    const newUrl = `${location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}`;
    navigate(newUrl, { replace: true });
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Email Change Complete
              </>
            ) : (
              <>
                <Mail className="h-5 w-5 text-blue-600" />
                Email Verification
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-left">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={handleClose}>
            {isSuccess ? "Continue" : "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
