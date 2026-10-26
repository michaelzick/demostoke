import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpenUrlButtonProps {
  url: string;
  label: string;
}

const isWebUrl = (value: string) => /^https?:\/\//i.test(value);

const OpenUrlButton = ({ url, label }: OpenUrlButtonProps) => {
  const trimmedUrl = url.trim();
  const canOpen = isWebUrl(trimmedUrl);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0"
      disabled={!canOpen}
      aria-label={label}
      title={label}
      onClick={() => window.open(trimmedUrl, "_blank", "noopener,noreferrer")}
    >
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};

export default OpenUrlButton;
