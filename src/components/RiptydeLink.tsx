import type { AnchorHTMLAttributes, ReactNode } from "react";
import { RIPTYDE_APP_STORE_URL } from "@/lib/gearCategories";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/utils/tracking";

export const RIPTYDE_ICON_SRC = "/img/logos/riptyde-icon.webp";

interface RiptydeIconProps {
  className?: string;
  /** Rendered pixel size, used for the intrinsic width/height to avoid layout shift. */
  size?: number;
}

/**
 * The Riptyde app icon. Decorative by default: every placement sits next to
 * visible text that already says "Riptyde", so screen readers skip the image.
 */
export const RiptydeIcon = ({ className, size = 20 }: RiptydeIconProps) => (
  <img
    src={RIPTYDE_ICON_SRC}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    className={cn("shrink-0 rounded-md object-cover", className)}
  />
);

interface RiptydeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel" | "onClick"> {
  /** Value sent as the `source` property of the `riptyde_link_click` event. */
  source: string;
  iconClassName?: string;
  iconSize?: number;
  /** Render text only; use when the surrounding layout already shows the icon. */
  hideIcon?: boolean;
  children: ReactNode;
}

/** Outbound link to the Riptyde App Store listing with the app icon and click tracking. */
export const RiptydeLink = ({
  source,
  iconClassName,
  iconSize,
  hideIcon = false,
  className,
  children,
  ...rest
}: RiptydeLinkProps) => (
  <a
    href={RIPTYDE_APP_STORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => trackEvent("riptyde_link_click", { source })}
    className={cn("inline-flex items-center gap-2", className)}
    {...rest}
  >
    {!hideIcon && <RiptydeIcon className={iconClassName} size={iconSize} />}
    {children}
  </a>
);

export default RiptydeLink;
