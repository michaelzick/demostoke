
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import useTheme from "@/contexts/useTheme";

interface SignatureFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  onSignatureChange: (signatureData: string | null) => void;
  label?: string;
  required?: boolean;
}

const SignatureField = ({
  onSignatureChange,
  label = "Signature",
  required = false,
  className,
  ...props
}: SignatureFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const { theme } = useTheme();

  // Initialize canvas and adjust drawing color based on theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas dimensions to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    // Set stroke color based on theme
    const isDarkMode = theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    ctx.strokeStyle = isDarkMode ? "#FFFFFF" : "#000000";
  }, [theme]);

  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSigned(true);

    // Get correct mouse/touch position relative to canvas
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get correct mouse/touch position relative to canvas
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);

      // Get signature data
      const canvas = canvasRef.current;
      if (!canvas) return;

      const signatureData = canvas.toDataURL("image/png");
      onSignatureChange(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    onSignatureChange(null);
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          {label} {required && <span className="text-[#ea384c] ml-1">*</span>}
        </label>
        {hasSigned && (
          <button
            type="button"
            onClick={clearSignature}
            className="text-xs text-blue-500 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div className="relative border rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full touch-none bg-white dark:bg-zinc-900 cursor-crosshair"
          style={{ height: "150px" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            Sign here
          </div>
        )}
      </div>
    </div>
  );
};

export default SignatureField;
