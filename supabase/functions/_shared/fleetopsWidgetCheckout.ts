export type FleetOpsWidgetCheckoutMode = "public" | "admin_only";

export interface FleetOpsWidgetViewerState {
  checkoutMode: FleetOpsWidgetCheckoutMode;
  isAdmin: boolean;
  isGuest: boolean;
  canCheckout: boolean;
}

export function resolveWidgetCheckoutMode(
  widgetConfig: unknown
): FleetOpsWidgetCheckoutMode {
  if (!widgetConfig || typeof widgetConfig !== "object") {
    return "public";
  }

  return (widgetConfig as { checkoutMode?: unknown }).checkoutMode ===
    "admin_only"
    ? "admin_only"
    : "public";
}

export function createWidgetViewer(
  checkoutMode: FleetOpsWidgetCheckoutMode,
  roles: Iterable<string>
): FleetOpsWidgetViewerState {
  const roleSet = new Set(Array.from(roles));
  const isAdmin = roleSet.has("admin");
  const isGuest = roleSet.has("guest");

  return {
    checkoutMode,
    isAdmin,
    isGuest,
    canCheckout: checkoutMode === "admin_only" ? isAdmin : !isGuest,
  };
}

