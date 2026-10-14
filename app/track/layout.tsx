import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Application Tracker",
  description: "Real-time passport application status tracking with reference ID and date of birth. Instant stage updates from submission to dispatch.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return children;
}
