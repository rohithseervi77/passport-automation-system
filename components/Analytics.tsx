"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Lightweight privacy-safe telemetry
    if (typeof window !== "undefined") {
      const pageViewData = {
        path: pathname,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || "direct",
        screen: `${window.innerWidth}x${window.innerHeight}`,
      };

      // In production, this can send to your telemetry endpoint or Google Analytics
      if (process.env.NODE_ENV === "production") {
        try {
          // Log or dispatch to custom analytics collector
          window.dispatchEvent(new CustomEvent("pas:pageview", { detail: pageViewData }));
        } catch {
          // Silent catch for ad-blockers or restricted environments
        }
      }
    }
  }, [pathname]);

  return null;
}
